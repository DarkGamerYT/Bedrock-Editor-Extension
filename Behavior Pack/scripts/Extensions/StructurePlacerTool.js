import * as Editor from "@minecraft/server-editor";
import { Color } from "../utils";
import { Structures } from "../structures";
export default (uiSession) => {
    const tool = uiSession.toolRail.addTool(
        {
            displayString: "Structure Placer (CTRL + P)",
            tooltip: "Left mouse click to place a structure",
            icon: "pack://textures/editor/structure_placer.png?filtering=point",
        },
    );
    
    const currentCursorState = uiSession.extensionContext.cursor.getState();
    currentCursorState.color = new Color(1, 1, 0, 1);
    currentCursorState.controlMode = Editor.CursorControlMode.KeyboardAndMouse;
    currentCursorState.targetMode = Editor.CursorTargetMode.Face;
    currentCursorState.visible = true;
    uiSession.scratchStorage = {
        currentCursorState,
    };
    
    tool.onModalToolActivation.subscribe(
        eventData => {
            if (eventData.isActiveTool)
                uiSession.extensionContext.cursor.setState(uiSession.scratchStorage.currentCursorState);
        },
    );

    uiSession.inputManager.registerKeyBinding(
        Editor.EditorInputContext.GlobalToolMode,
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => {
                    uiSession.toolRail.setSelectedOptionId(tool.id, true);
                },
            },
        ),
        Editor.KeyboardKey.KEY_P,
        Editor.InputModifier.Control,
    );
    
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Structure Placer",
            width: 73,
        },
    );
    
    const settings = Editor.createPaneBindingObject(
        pane,
        {
            structureName: "",
            face: true,
            vanillaStructure: "",
            rotation: "0_degrees",
            mirror: "none",
            includeEntities: true,
            waterlogBlocks: false,
            removeBlocks: false,
            offset: {
                x: 0,
                y: 0,
                z: 0
            }
        }
    );
    
    pane.addString(
        settings,
        "structureName",
        {
            titleAltText: "Structure Name",
        },
    );

    pane.addBool(
        settings,
        "face",
        {
            titleAltText: "Face Mode",
            onChange: (_obj, _property, _oldValue, _newValue) => {
                if (uiSession.scratchStorage === undefined) {
                    console.error('Cube storage was not initialized.');
                    return;
                }
                uiSession.scratchStorage.currentCursorState.targetMode = settings.face
                    ? Editor.CursorTargetMode.Face
                    : Editor.CursorTargetMode.Block;
                uiSession.extensionContext.cursor.setState(uiSession.scratchStorage.currentCursorState);
            },
        }
    );

    pane.addDropdown(
        settings,
        "vanillaStructure",
        {
            titleAltText: "Vanilla Structure",
            dropdownItems: [...Structures].map((name) => ({ value:name[0], displayAltText: name[0] })),
            onChange: (_obj, _property, _oldValue, _newValue) => {
                settings.structureName = settings.vanillaStructure;
                settings.offset = {
                    x: Math.floor(-(Structures.get(settings.structureName)[0]/2)),
                    y: 0,
                    z: Math.floor(-(Structures.get(settings.structureName)[2]/2))
                };
            },
        },
    );

    pane.addVec3(
        settings,
        "offset",
        {
            titleAltText: "Offset",
            enable: true,
        }
    );

    pane.addDropdown(
        settings,
        "rotation",
        {
            titleAltText: "Rotation",
            dropdownItems: [
                {
                    displayAltText: "0°",
                    value: "0_degrees",
                },
                {
                    displayAltText: "90°",
                    value: "90_degrees",
                },
                {
                    displayAltText: "180°",
                    value: "180_degrees",
                },
                {
                    displayAltText: "270°",
                    value: "270_degrees",
                },
            ],
        }
    );

    pane.addDropdown(
        settings,
        "mirror",
        {
            titleAltText: "Mirror",
            dropdownItems: [
                {
                    displayAltText: "None",
                    value: "none",
                },
                {
                    displayAltText: "X",
                    value: "x",
                },
                {
                    displayAltText: "XZ",
                    value: "xz",
                },
                {
                    displayAltText: "Z",
                    value: "z",
                },
            ],
        }
    );

    pane.addBool(
        settings,
        "includeEntities", {
            titleAltText: "Include Entities",
        }
    );

    pane.addBool(
        settings,
        "waterlogBlocks", {
            titleAltText: "Waterlog Blocks",
        }
    );

    pane.addBool(
        settings,
        "removeBlocks", {
            titleAltText: "Remove Blocks",
        }
    );
    
    tool.bindPropertyPane(pane);
    
    tool.registerMouseButtonBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: (mouseRay, mouseProps) => {
                    if (mouseProps.mouseAction == Editor.MouseActionType.LeftButton) {
                        if (mouseProps.inputType == Editor.MouseInputType.ButtonDown) {
                            uiSession.extensionContext.selectionManager.selection.clear();
                        } else if (mouseProps.inputType == Editor.MouseInputType.ButtonUp) {
                            const player = uiSession.extensionContext.player;
                            if(settings.structureName.trim().length == 0) return;
                            player.dimension.runCommandAsync(
                                "structure load \""
                                + settings.structureName
                                + "\" "
                                + (uiSession.extensionContext.cursor.position.x + settings.offset.x)
                                + " "
                                + (uiSession.extensionContext.cursor.position.y + settings.offset.y)
                                + " "
                                + (uiSession.extensionContext.cursor.position.z + settings.offset.z)
                                + " "
                                + settings.rotation
                                + " "
                                + settings.mirror
                                + " "
                                + settings.includeEntities
                                + " "
                                + !settings.removeBlocks
                                + " "
                                + settings.waterlogBlocks
                            );

                            uiSession.extensionContext.selectionManager.selection.clear();
                        };
                    };
                },
            },
        ),
    );
};