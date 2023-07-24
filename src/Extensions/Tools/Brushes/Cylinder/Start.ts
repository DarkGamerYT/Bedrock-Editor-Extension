import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
import * as VanillaData from "@minecraft/vanilla-data";
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
    uiSession.log.debug( `Initializing ${uiSession.extensionContext.extensionName} extension` );
    const tool = uiSession.toolRail.addTool(
        {
            displayAltText: "Cylinder (CTRL + SHIFT + C)",
            tooltipAltText: "Left mouse click or drag-to-paint",
            icon: "pack://textures/editor/cylinder.png?filtering=point",
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
        Editor.KeyboardKey.KEY_C,
        Editor.InputModifier.Shift | Editor.InputModifier.Control,
    );
    
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Cylinder",
            titleStringId: "",
        },
    );
    
    const settings = Editor.bindDataSource(
        pane,
        {
            size: 3,
            height: 6,
            hollow: false,
            face: false,
            blockType: VanillaData.MinecraftBlockTypes.Stone,
        },
    );

    pane.addNumber(
        settings,
        "size",
        {
            titleAltText: "Brush Size",
            min: 1,
            max: 16,
            showSlider: true,
        },
    );

    pane.addNumber(
        settings,
        "height",
        {
            titleAltText: "Height",
            min: 1,
            max: 8,
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
        if (!uiSession.scratchStorage?.previewSelection) return uiSession.log.error( "Cylinder storage was not initialized." );
        
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

        const cylinder = drawCylinder( location, settings.size, settings.height, settings.hollow );
        const volumes = cylinder.calculateVolumes();
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
                        if (mouseProps.modifiers.ctrl) {
                            if (
                                mouseProps.inputType === Editor.MouseInputType.WheelOut
                                && settings.height < 8
                            ) settings.height++;
                            else if (
                                mouseProps.inputType === Editor.MouseInputType.WheelIn
                                && settings.height > 1
                            ) settings.height--;
                        } else {
                            if (
                                mouseProps.inputType === Editor.MouseInputType.WheelOut
                                && settings.size < 16
                            ) settings.size++;
                            else if (
                                mouseProps.inputType === Editor.MouseInputType.WheelIn
                                && settings.size > 1
                            ) settings.size--;
                        };
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

const drawCylinder = (
    location: Server.Vector3,
    radius: number,
    height: number,
    hollow: boolean = false,
) => {
	const mesh = new Mesh();
	for (let i = 0; i < height; i++) {
		let centerX = location.x;
		let centerY = location.y + i;
		let centerZ = location.z;
        
		for (let j = -radius; j <= radius; j++) {
			for (let k = -radius; k <= radius; k++) {
				const distance = Math.sqrt( j * j + k * k );
				if (
					( !hollow && distance <= radius )
					|| (
						hollow
						&& (
							( distance >= radius - 0.5 && distance <= radius + 0.5 )
							&& (
								( i == 0 && distance < radius - 0.5 )
								|| ( i == height - 1 && distance < radius - 0.5 )
							)
							|| ( i != 0 && i != height - 1 && distance < radius - 0.5 )
						)
						&& (
							distance >= radius - 1.5
							|| ( i == 0 || i == height - 1 )
						)
					)
				) {
					mesh.add(
						{
							x: centerX + j,
							y: centerY,
							z: centerZ + k,
						},
					);
				};
			};
		};
	};

	return mesh;
};