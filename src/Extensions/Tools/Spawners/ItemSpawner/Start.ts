import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
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
    uiSession.log.debug( `Initializing ${uiSession.extensionContext.extensionInfo.name} extension` );
    const tool = uiSession.toolRail.addTool(
        {
            displayAltText: "Item Spawner (CTRL + I)",
            tooltipAltText: "Left mouse click or drag-to-spawn",
            icon: "pack://textures/editor/item.png?filtering=point",
        },
    );

    const previewSelection = uiSession.extensionContext.selectionManager.create();
    previewSelection.visible = true;
    previewSelection.setOutlineColor( new Color( 0, 0.5, 0.5, 0.2 ) );
    previewSelection.setFillColor( new Color( 0, 0, 0.5, 0.1 ) );
    
    uiSession.scratchStorage = {
        currentCursorState: {
            outlineColor: new Color( 0, 0.5, 0.5, 1 ),
            controlMode: Editor.CursorControlMode.KeyboardAndMouse,
            targetMode: Editor.CursorTargetMode.Face,
            visible: true,
            fixedModeDistance: 5,
        },
        previewSelection,
    };
    
    tool.onModalToolActivation.subscribe(
        (eventData) => {
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
        Editor.KeyboardKey.KEY_I,
        Editor.InputModifier.Control,
    );
    
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Item Spawner",
            titleStringId: "",
            width: 40,
        },
    );
    
    const settings = Editor.bindDataSource(
        pane,
        {
            itemType: "minecraft:diamond_sword",
            amount: 1,
        },
    );

    const blocks = new Set([ ...Server.BlockTypes.getAll() ].map(({ id }) => id))
    const items = [ ...Server.ItemTypes.getAll() ].map(({ id }) => id).reduce(
        ( e, id ) => (
            (
                blocks.has( id )
                || e.push( id )
            ),
            e
        ),
        [],
    ).sort(( e, id ) => e.localeCompare( id ));

    pane.addDropdown(
        settings,
        "itemType",
        {
            titleAltText: "Item Type",
			dropdownItems: items.map(
                (id) => (
                    {
                        value: id,
                        displayAltText: id,
                        displayStringId: "item." + id.replace("minecraft:", "") + ".name",
                    }
                ),
            ),
        },
    );

    pane.addNumber(
        settings,
        "amount",
        {
            titleAltText: "Amount",
            min: 1,
            max: 64,
            showSlider: true,
        },
    );
    
    tool.bindPropertyPane( pane );
    
    const onExecuteBrush = () => {
        if (!uiSession.scratchStorage?.previewSelection) {
            uiSession.log.error( "Item Spawner storage was not initialized." );
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

    tool.registerMouseWheelBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: async ( mouseRay, mouseProps ) => {
                    if (mouseProps.modifiers.ctrl) {
                        if (
                            mouseProps.inputType == Editor.MouseInputType.WheelOut
                            && settings.amount + 8 < 64
                        ) settings.amount += 8;
                        else if (
                            mouseProps.inputType == Editor.MouseInputType.WheelIn
                            && settings.amount - 8 > 1
                        ) settings.amount -= 8;
                    } else {
                        if (
                            mouseProps.inputType == Editor.MouseInputType.WheelOut
                            && settings.amount < 64
                        ) settings.amount++;
                        else if (
                            mouseProps.inputType == Editor.MouseInputType.WheelIn
                            && settings.amount > 1
                        ) settings.amount--;
                    };
                },
            },
        ),
    );
    
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
                                        const item = player.dimension.spawnItem(
                                            new Server.ItemStack( settings.itemType, settings.amount ),
                                            {
                                                x: targetBlock.x + 0.5,
                                                y: targetBlock.y,
                                                z: targetBlock.z + 0.5,
                                            },
                                        );
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