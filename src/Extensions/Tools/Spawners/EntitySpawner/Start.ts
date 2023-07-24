import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
import * as VanillaData from "@minecraft/vanilla-data";
import { Color } from "../../../../utils";
type ExtensionStorage = {
    currentCursorState: {
        outlineColor: Color,
        controlMode: Editor.CursorControlMode,
        targetMode: Editor.CursorTargetMode,
        visible: boolean,
        fixedModeDistance: number,
    },
    previewSelection: Editor.Selection,
    lastVolumePlaced?: Server.BoundingBox,
};

export const Start = ( uiSession: Editor.IPlayerUISession<ExtensionStorage> ) => {
    uiSession.log.debug( `Initializing ${uiSession.extensionContext.extensionName} extension` );
    const tool = uiSession.toolRail.addTool(
        {
            displayAltText: "Entity Spawner (CTRL + E)",
            tooltipAltText: "Left mouse click or drag-to-spawn",
            icon: "pack://textures/editor/entity.png?filtering=point",
        },
    );

    const previewSelection = uiSession.extensionContext.selectionManager.create();
    previewSelection.visible = true;
    previewSelection.setOutlineColor( new Color( 0, 1, 0, 0.2 ) );
    previewSelection.setFillColor( new Color( 0, 1, 0, 0.1 ) );
    
    uiSession.scratchStorage = {
        currentCursorState: {
            outlineColor: new Color( 0, 1, 0, 1 ),
            controlMode: Editor.CursorControlMode.KeyboardAndMouse,
            targetMode: Editor.CursorTargetMode.Face,
            visible: true,
            fixedModeDistance: 5,
        },
        previewSelection,
    };
    
    tool.onModalToolActivation.subscribe(
        eventData => {
            if (eventData.isActiveTool) {
                uiSession.extensionContext.cursor.setProperties( uiSession.scratchStorage.currentCursorState );
            };
        },
    );
    
    uiSession.inputManager.registerKeyBinding(
        Editor.EditorInputContext.GlobalToolMode,
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => {
                    uiSession.toolRail.setSelectedOptionId( tool.id, true );
                },
            },
        ),
        Editor.KeyboardKey.KEY_E,
        Editor.InputModifier.Control,
    );
    
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Entity Spawner",
            titleStringId: "",
            width: 40,
        },
    );
    
    const settings = Editor.bindDataSource(
        pane,
        {
            nameTag: "",
            entityType: VanillaData.MinecraftEntityTypes.Creeper,
        },
    );

    const notAllowedEntities = new Set(
        [
            "minecraft:agent",
            "minecraft:area_effect_cloud",
            "minecraft:dragon_fireball",
            "minecraft:egg",
            "minecraft:ender_pearl",
            "minecraft:eye_of_ender_signal",
            "minecraft:fireball",
            "minecraft:fireworks_rocket",
            "minecraft:fishing_hook",
            "minecraft:lingering_potion",
            "minecraft:llama_spit",
            "minecraft:player",
            "minecraft:shulker_bullet",
            "minecraft:small_fireball",
            "minecraft:snowball",
            "minecraft:splash_potion",
            "minecraft:thrown_trident",
            "minecraft:tripod_camera",
            "minecraft:villager",
            "minecraft:xp_bottle",
        ],
    );

    const entities = [ ...Server.EntityTypes.getAll() ].map(({ id }) => id).reduce(
        ( e, id ) => (
            (
                notAllowedEntities.has( id )
                || e.push( id )
            ),
            e
        ),
        [],
    ).sort(( e, id ) => e.localeCompare( id ));

    pane.addDropdown(
        settings,
        "entityType",
        {
            titleAltText: "Entity Type",
            dropdownItems: entities.map(
                (id) => (
                    {
                        value: id,
                        displayAltText: id,
                        displayStringId: "entity." + id.replace( "minecraft:", "" ) + ".name",
                    }
                ),
            ),
        },
    );

    pane.addString( settings, "nameTag", { titleAltText: "Name Tag" } );
    tool.bindPropertyPane( pane );
    
    const onExecuteBrush = () => {
        if (!uiSession.scratchStorage?.previewSelection) {
            uiSession.log.error( "Entity Spawner storage was not initialized." );
            return;
        };
        
        const previewSelection = uiSession.scratchStorage.previewSelection;
        const player = uiSession.extensionContext.player;
        const targetBlock = player.dimension.getBlock( uiSession.extensionContext.cursor.getPosition() );
        if (!targetBlock) return;

        const blockVolume = {
            from: targetBlock.location,
            to: targetBlock.location,
        };
        
        if (uiSession.scratchStorage.lastVolumePlaced && Server.BoundingBoxUtils.equals( uiSession.scratchStorage.lastVolumePlaced, Server.BlockVolumeUtils.getBoundingBox( blockVolume ) )) return;
        previewSelection.pushVolume(
            {
                action: Server.CompoundBlockVolumeAction.Add,
                volume: blockVolume,
            },
        );

        uiSession.scratchStorage.lastVolumePlaced = Server.BlockVolumeUtils.getBoundingBox( blockVolume );
    };
    
    tool.registerMouseButtonBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: async (mouseRay, mouseProps) => {
                    if (mouseProps.mouseAction == Editor.MouseActionType.LeftButton) {
                        if (mouseProps.inputType == Editor.MouseInputType.ButtonDown) {
                            uiSession.scratchStorage.previewSelection.clear();
                            onExecuteBrush();
                        } else if (mouseProps.inputType == Editor.MouseInputType.ButtonUp) {
                            await Editor.executeLargeOperation(
                                uiSession.scratchStorage.previewSelection,
                                (blockLocation) => {
                                    const player = uiSession.extensionContext.player;
                                    const targetBlock = player.dimension.getBlock( blockLocation );
                                    
                                    if (targetBlock) {
                                        const entity = player.dimension.spawnEntity(
                                            settings.entityType,
                                            {
                                                x: targetBlock.x + 0.5,
                                                y: targetBlock.y,
                                                z: targetBlock.z + 0.5,
                                            },
                                        );

                                        entity.nameTag = settings.nameTag;
                                    };
                                },
                            ).catch(
                                () => {
                                    uiSession.extensionContext.transactionManager.commitOpenTransaction();
                                    uiSession.scratchStorage?.previewSelection.clear();
                                },
                            ).then(
                                () => {
                                    uiSession.extensionContext.transactionManager.commitOpenTransaction();
                                    uiSession.scratchStorage?.previewSelection.clear();
                                },
                            );
                        };
                    };
                },
            },
        ),
    );
    
    tool.registerMouseDragBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: (mouseRay, mouseProps) => {
                    if (mouseProps.inputType === Editor.MouseInputType.Drag) onExecuteBrush();
                },
            },
        ),
    );

    return [];
};