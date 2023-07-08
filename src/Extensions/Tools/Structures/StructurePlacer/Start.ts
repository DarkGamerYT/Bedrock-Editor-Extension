import * as Editor from "@minecraft/server-editor";
import { Color } from "../../../../utils";
import { Structures } from "../Structures";
type ExtensionStorage = {
    currentCursorState: {
        outlineColor: Color,
        controlMode: Editor.CursorControlMode,
        targetMode: Editor.CursorTargetMode,
        visible: boolean,
        fixedModeDistance: number,
    },
};

export const Start = (uiSession: import("@minecraft/server-editor").IPlayerUISession<ExtensionStorage>) => {
    uiSession.log.debug(`Initializing ${uiSession.extensionContext.extensionName} extension`);
    const tool = uiSession.toolRail.addTool(
        {
            displayAltText: "Structure Placer (CTRL + P)",
            tooltipAltText: "Left mouse click to place a structure",
            icon: "pack://textures/editor/structure_placer.png?filtering=point",
        },
    );

    uiSession.scratchStorage = {
        currentCursorState: {
            outlineColor: new Color(1, 1, 0, 1),
            controlMode: Editor.CursorControlMode.KeyboardAndMouse,
            targetMode: Editor.CursorTargetMode.Face,
            visible: true,
            fixedModeDistance: 5
        },
    };
    
    tool.onModalToolActivation.subscribe(
        eventData => {
            if (eventData.isActiveTool)
                uiSession.extensionContext.cursor.setProperties(uiSession.scratchStorage.currentCursorState);
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
            titleStringId: "",
            width: 73,
        },
    );
    
    const settings = Editor.bindDataSource(
        pane,
        {
            structureName: "",
            face: true,
            vanillaStructure: "",
            rotation: 0,
            mirror: 0,
            includeEntities: true,
            waterlogBlocks: false,
            removeBlocks: false,
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
                    uiSession.log.error('Cube storage was not initialized.');
                    return;
                }
                uiSession.scratchStorage.currentCursorState.targetMode = settings.face
                    ? Editor.CursorTargetMode.Face
                    : Editor.CursorTargetMode.Block;
                uiSession.extensionContext.cursor.setProperties(uiSession.scratchStorage.currentCursorState);
            },
        }
    );

    pane.addDropdown(
        settings,
        "vanillaStructure",
        {
            titleAltText: "Vanilla Structure",
            dropdownItems: Structures.map(
                (value, index) => (
                    {
                        displayAltText: value,
                        displayStringId: "",
                        value: index,
                    }
                ),
            ),
            onChange: (_obj, _property, _oldValue, _newValue) => {
                settings.structureName = settings.vanillaStructure;
            },
        },
    );

    const rotations = [
        "0_degrees",
        "90_degrees",
        "180_degrees",
        "270_degrees",
    ];

    pane.addDropdown(
        settings,
        "rotation",
        {
            titleAltText: "Rotation",
            dropdownItems: [
                {
                    displayAltText: "0°",
                    displayStringId: "",
                    value: 0,
                },
                {
                    displayAltText: "90°",
                    displayStringId: "",
                    value: 1,
                },
                {
                    displayAltText: "180°",
                    displayStringId: "",
                    value: 2,
                },
                {
                    displayAltText: "270°",
                    displayStringId: "",
                    value: 3,
                },
            ],
        }
    );

    const mirrors = [
        "none",
        "x",
        "xz",
        "z",
    ];

    pane.addDropdown(
        settings,
        "mirror",
        {
            titleAltText: "Mirror",
            dropdownItems: [
                {
                    displayAltText: "None",
                    displayStringId: "",
                    value: 0,
                },
                {
                    displayAltText: "X",
                    displayStringId: "",
                    value: 1,
                },
                {
                    displayAltText: "XZ",
                    displayStringId: "",
                    value: 2,
                },
                {
                    displayAltText: "Z",
                    displayStringId: "",
                    value: 3,
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
                    try {
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
                                + uiSession.extensionContext.cursor.getPosition().x
                                + " "
                                + uiSession.extensionContext.cursor.getPosition().y
                                + " "
                                + uiSession.extensionContext.cursor.getPosition().z
                                + " "
                                + rotations[settings.rotation]
                                + " "
                                + mirrors[settings.mirror]
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
                    } catch(e) { uiSession.log.warning(e); };
                },
            },
        ),
    );

    return [];
};