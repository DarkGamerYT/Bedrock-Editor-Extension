import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
import { Color } from "../utils";
export default (uiSession) => {
    const tool = uiSession.toolRail.addTool(
        {
            displayString: "Block Modifier",
            tooltip: "",
            icon: "pack://textures/editor/block_modifier.png?filtering=point",
        },
    );
    
    const currentCursorState = uiSession.extensionContext.cursor.getState();
    currentCursorState.color = new Color(1, 1, 0, 1);
    currentCursorState.controlMode = Editor.CursorControlMode.KeyboardAndMouse;
    currentCursorState.targetMode = Editor.CursorTargetMode.Block;
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
        Editor.KeyboardKey.KEY_E,
        Editor.InputModifier.Control,
    );
    
    tool.registerMouseButtonBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: async (mouseRay, mouseProps) => {
                    if (mouseProps.mouseAction == Editor.MouseActionType.LeftButton) {
                        if (mouseProps.inputType == Editor.MouseInputType.ButtonDown) {
                            const player = uiSession.extensionContext.player;
                            const targetBlock = player.dimension.getBlock(uiSession.extensionContext.cursor.position);
                            const pane = uiSession.createPropertyPane(
                                {
                                    titleAltText: "Block Modifier",
                                    width: 40,
                                },
                            );
                            
                            const settings = Editor.createPaneBindingObject(
                                pane,
                                {
                                    blockType: targetBlock.typeId,
                                    location: targetBlock.location,
                                    waterlogged: targetBlock.isWaterlogged,
                                    weirdo_direction: targetBlock.permutation.getProperty("weirdo_direction"),
                                    direction: targetBlock.permutation.getProperty("direction"),
                                    lever_direction: targetBlock.permutation.getProperty("lever_direction"),
                                    brushed_progress: targetBlock.permutation.getProperty("brushed_progress"),
                                    growth: targetBlock.permutation.getProperty("growth"),
                                    redstone_signal: targetBlock.permutation.getProperty("redstone_signal"),
                                    repeater_delay: targetBlock.permutation.getProperty("repeater_delay"),
                                    rail_direction: targetBlock.permutation.getProperty("rail_direction"),
                                    damage: targetBlock.permutation.getProperty("damage"),
                                },
                            );
                        
                            pane.addString(
                                settings,
                                "blockType",
                                {
                                    titleAltText: "Block Type",
                                    enable: false,
                                },
                            );

                            pane.addVec3(
                                settings,
                                "location",
                                {
                                    titleAltText: "Location",
                                    enable: false,
                                    minX: Number.MIN_SAFE_INTEGER,
                                    minY: Number.MIN_SAFE_INTEGER,
                                    minZ: Number.MIN_SAFE_INTEGER,
                                }
                            );
                            
                            if(Server.MinecraftBlockTypes.get(targetBlock.typeId).canBeWaterlogged) {
                                pane.addBool(
                                    settings,
                                    "waterlogged",
                                    {
                                        titleAltText: "Waterlogged",
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            targetBlock.isWaterlogged = settings.waterlogged;
                                        },
                                    }
                                );
                            };

                            if(targetBlock.permutation.getProperty("lever_direction")) {
                                pane.addDropdown(
                                    settings,
                                    "lever_direction",
                                    {
                                        titleAltText: "Lever Direction",
                                        dropdownItems: Server.BlockProperties.get("lever_direction").validValues.map(
                                            (value) => (
                                                {
                                                    displayAltText: value,
                                                    value,
                                                }
                                            ),
                                        ),
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    lever_direction: settings.lever_direction,
                                                },
                                            );

                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };
                            
                            if(targetBlock.permutation.getProperty("redstone_signal") != undefined) {
                                pane.addNumber(
                                    settings,
                                    "redstone_signal",
                                    {
                                        titleAltText: "Redstone Signal",
                                        min: 0,
                                        max: 15,
                                        showSlider: true,
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    redstone_signal: settings.redstone_signal,
                                                },
                                            );
                                            
                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };

                            if(targetBlock.permutation.getProperty("repeater_delay") != undefined) {
                                pane.addNumber(
                                    settings,
                                    "repeater_delay",
                                    {
                                        titleAltText: "Repeater Delay",
                                        min: 0,
                                        max: 3,
                                        showSlider: true,
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    repeater_delay: settings.repeater_delay,
                                                },
                                            );
                                            
                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };

                            if(
                                targetBlock.permutation.getProperty("weirdo_direction") != undefined
                                || targetBlock.permutation.getProperty("direction") != undefined
                            ) {
                                pane.addNumber(
                                    settings,
                                    targetBlock.permutation.getProperty("weirdo_direction") != undefined ? "weirdo_direction" :"direction",
                                    {
                                        titleAltText: "Direction",
                                        min: 0,
                                        max: 3,
                                        showSlider: true,
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            try {
                                                let direction = targetBlock.permutation.getProperty("weirdo_direction") != undefined ? { weirdo_direction: settings.weirdo_direction } : { direction: settings.direction };
                                                const blockPermutation = Server.BlockPermutation.resolve(
                                                    targetBlock.typeId,
                                                    direction,
                                                );
                                                
                                                targetBlock.setPermutation(blockPermutation);
                                            } catch(e) {};
                                        },
                                    }
                                );
                            };

                            if(targetBlock.permutation.getProperty("brushed_progress") != undefined) {
                                pane.addNumber(
                                    settings,
                                    "brushed_progress",
                                    {
                                        titleAltText: "Brushed Progress",
                                        min: 0,
                                        max: 3,
                                        showSlider: true,
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    brushed_progress: settings.brushed_progress,
                                                },
                                            );
                                            
                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };

                            if(targetBlock.permutation.getProperty("growth") != undefined) {
                                pane.addNumber(
                                    settings,
                                    "growth",
                                    {
                                        titleAltText: "Growth",
                                        min: 0,
                                        max: 7,
                                        showSlider: true,
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    growth: settings.growth,
                                                },
                                            );
                                            
                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };

                            if(targetBlock.permutation.getProperty("rail_direction") != undefined) {
                                pane.addNumber(
                                    settings,
                                    "rail_direction",
                                    {
                                        titleAltText: "Rail Direction",
                                        min: 0,
                                        max: 9,
                                        showSlider: true,
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    rail_direction: settings.rail_direction,
                                                },
                                            );
                                            
                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };

                            if(targetBlock.permutation.getProperty("damage")) {
                                pane.addDropdown(
                                    settings,
                                    "damage",
                                    {
                                        titleAltText: "Damage",
                                        dropdownItems: Server.BlockProperties.get("damage").validValues.map(
                                            (value) => (
                                                {
                                                    displayAltText: value,
                                                    value,
                                                }
                                            ),
                                        ),
                                        onChange: (_obj, _property, _oldValue, _newValue) => {
                                            const blockPermutation = Server.BlockPermutation.resolve(
                                                targetBlock.typeId,
                                                {
                                                    damage: settings.damage,
                                                },
                                            );

                                            targetBlock.setPermutation(blockPermutation);
                                        },
                                    }
                                );
                            };

                            tool.bindPropertyPane(pane);
                            pane.update(true);
                        };
                    };
                },
            },
        ),
    );
};