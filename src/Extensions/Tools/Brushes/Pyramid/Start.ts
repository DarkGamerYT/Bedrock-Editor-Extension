import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
import { Color, stringFromException } from "../../../../utils";
import { Mesh } from "../Mesh";
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
    lastCursorPosition?: Server.Vector3,
};

export const Start = ( uiSession: Editor.IPlayerUISession<ExtensionStorage> ) => {
    uiSession.log.debug( `Initializing ${uiSession.extensionContext.extensionInfo.name} extension` );
    const tool = uiSession.toolRail.addTool(
        {
            displayAltText: "Pyramid",
            tooltipAltText: "Left mouse click or drag-to-paint",
            icon: "pack://textures/editor/pyramid.png?filtering=point",
        },
    );

    const previewSelection = uiSession.extensionContext.selectionManager.create();
    previewSelection.visible = true;
    previewSelection.setOutlineColor( new Color( 0, 0.5, 0.5, 0.2 ) );
    previewSelection.setFillColor( new Color( 0, 0, 0.5, 0.1 ) );
    
    uiSession.scratchStorage = {
        currentCursorState: {
            outlineColor: new Color( 1, 1, 0, 1 ),
            controlMode: Editor.CursorControlMode.KeyboardAndMouse,
            targetMode: Editor.CursorTargetMode.Block,
            visible: true,
            fixedModeDistance: 5,
        },
        previewSelection,
    };
    
    tool.onModalToolActivation.subscribe(
        (data) => {
            if (data.isActiveTool) {
                uiSession.extensionContext.cursor.setProperties( uiSession.scratchStorage.currentCursorState );
            };
        },
    );
    
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Pyramid",
            titleStringId: "",
        },
    );
    
    const settings = Editor.bindDataSource(
        pane,
        {
            size: 6,
            hollow: false,
            face: false,
            blockType: "minecraft:stone",
        },
    );

    pane.addNumber(
        settings,
        "size",
        {
            titleAltText: "Brush Size",
            min: 1,
            max: 12,
            showSlider: true,
        },
    );
    
    pane.addBool( settings, "hollow", { titleAltText: "Hollow" } );
    pane.addBool(
        settings,
        "face",
        {
            titleAltText: "Face Mode",
            onChange: () => {
                if (uiSession.scratchStorage === undefined) return uiSession.log.error( "Cylinder storage was not initialized." );
                uiSession.scratchStorage.currentCursorState.targetMode = (
                    settings.face
                    ? Editor.CursorTargetMode.Face
                    : Editor.CursorTargetMode.Block
                );
                
                uiSession.extensionContext.cursor.setProperties( uiSession.scratchStorage.currentCursorState );
            },
        },
    );

    pane.addDivider();
    pane.addBlockPicker( settings, "blockType", { titleAltText: "Block Type" } );
    tool.bindPropertyPane( pane );
    
    const onExecuteBrush = () => {
        if (!uiSession.scratchStorage?.previewSelection) return uiSession.log.error( "Pyramid storage was not initialized." );
        
        const previewSelection = uiSession.scratchStorage.previewSelection;
        const player = uiSession.extensionContext.player;
        const targetBlock = player.dimension.getBlock( uiSession.extensionContext.cursor.getPosition() );
        if (!targetBlock) return;
        const location = targetBlock.location;
        if (
            uiSession.scratchStorage.lastCursorPosition?.x == uiSession.extensionContext.cursor.getPosition().x
            && uiSession.scratchStorage.lastCursorPosition?.y == uiSession.extensionContext.cursor.getPosition().y
            && uiSession.scratchStorage.lastCursorPosition?.z == uiSession.extensionContext.cursor.getPosition().z
        ) return;
        
        const pyramid = drawPyramid( location, settings.size, settings.hollow );
        const volumes = pyramid.calculateVolumes();
        for (let i = 0; i < volumes.length; i++) {
            const blockVolume = volumes[i];
            if (
                (
                    blockVolume.from.y >= -64
                    && blockVolume.from.y <= 320
                )
                || (
                    blockVolume.to.y >= -64
                    && blockVolume.to.y <= 320
                )
            ) {
                previewSelection.pushVolume(
                    {
                        action: Server.CompoundBlockVolumeAction.Add,
                        volume: blockVolume,
                    },
                );
            };
        };

        uiSession.scratchStorage.lastCursorPosition = uiSession.extensionContext.cursor.getPosition();
    };

    tool.registerMouseWheelBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: async ( mouseRay, mouseProps ) => {
                    if (mouseProps.mouseAction === Editor.MouseActionType.Wheel) {
                        if (
                            mouseProps.inputType === Editor.MouseInputType.WheelOut
                            && settings.size < 12
                        ) settings.size++;
                        else if (
                            mouseProps.inputType === Editor.MouseInputType.WheelIn
                            && settings.size > 1
                        ) settings.size--;
                    };
                },
            },
        ),
    );
    
    tool.registerMouseButtonBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: async ( mouseRay, mouseProps ) => {
                    if (mouseProps.mouseAction === Editor.MouseActionType.LeftButton) {
                        if (mouseProps.inputType === Editor.MouseInputType.ButtonDown) {
                            uiSession.extensionContext.transactionManager.openTransaction( "cylinderTool" );
                            uiSession.scratchStorage.previewSelection.clear();
                            onExecuteBrush();
                        } else if (mouseProps.inputType === Editor.MouseInputType.ButtonUp) {
                            const player = uiSession.extensionContext.player;

                            try {
                                uiSession.extensionContext.transactionManager.trackBlockChangeSelection( uiSession.scratchStorage.previewSelection );
                            } catch (e) {
                                uiSession.log.warning( `Unable to execute brush. ${stringFromException(e)}` );
                                uiSession.extensionContext.transactionManager.discardOpenTransaction();
                                return;
                            };

                            await Editor.executeLargeOperation(
                                uiSession.scratchStorage.previewSelection,
                                (blockLocation) => {
                                    if (
                                        blockLocation.y >= -64
                                        && blockLocation.y <= 320
                                    ) {
                                        Server.system.run(
                                            async function runnable() {
                                                const block = player.dimension.getBlock( blockLocation );
                                                if (block) {
                                                    block.setType( settings.blockType );
                                                };
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

const drawPyramid = (
    location: Server.Vector3,
    size: number,
    hollow: boolean = false
) => {
    const mesh = new Mesh();
    const pyramidBase = size * 2 - 1;
    const halfBase = Math.floor( pyramidBase / 2 );

    for (let y = 0; y < size; y++) {
        const layerOffset = halfBase - y;
        for (let x = -layerOffset; x <= layerOffset; x++) {
            for (let z = -layerOffset; z <= layerOffset; z++) {
                const absX = location.x + x;
                const absY = location.y + y;
                const absZ = location.z + z;

                if (
                    hollow
                    && y > 0
                    && y < size - 1
                    && x > -layerOffset
                    && x < layerOffset
                    && z > -layerOffset
                    && z < layerOffset
                ) continue;

                mesh.add(
                    {
                        x: absX,
                        y: absY,
                        z: absZ,
                    },
                );
            };
        };
    };

    return mesh;
};