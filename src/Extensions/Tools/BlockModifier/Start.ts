import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
import { Color } from "../../../utils";
type ExtensionStorage = {
    currentCursorState: {
        outlineColor: Color,
        controlMode: Editor.CursorControlMode,
        targetMode: Editor.CursorTargetMode,
        visible: boolean,
        fixedModeDistance: number,
    },
};

export const Start = ( uiSession: Editor.IPlayerUISession<ExtensionStorage> ) => {
    uiSession.log.debug( `Initializing ${uiSession.extensionContext.extensionInfo.name} extension` );
    const tool = uiSession.toolRail.addTool(
        {
            displayAltText: "Block Modifier",
            tooltipAltText: "",
            icon: "pack://textures/editor/block_modifier.png?filtering=point",
        },
    );

    uiSession.scratchStorage = {
        currentCursorState: {
            outlineColor: new Color( 1, 1, 0, 1 ),
            controlMode: Editor.CursorControlMode.KeyboardAndMouse,
            targetMode: Editor.CursorTargetMode.Block,
            visible: true,
            fixedModeDistance: 5,
        },
    };
    
    tool.onModalToolActivation.subscribe(
        eventData => {
            if (eventData.isActiveTool) {
                uiSession.extensionContext.cursor.setProperties( uiSession.scratchStorage.currentCursorState );
            };
        },
    );
    
    tool.registerMouseButtonBinding(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.MouseRayCastAction,
                onExecute: ( mouseRay, mouseProps ) => {
                    if (mouseProps.mouseAction == Editor.MouseActionType.LeftButton) {
                        if (mouseProps.inputType == Editor.MouseInputType.ButtonDown) {
                            blockModifier( uiSession, tool, uiSession.extensionContext.player, uiSession.extensionContext.cursor.getPosition() );
                        };
                    };
                },
            },
        ),
    );

    return [];
};

const blockModifier = ( uiSession: Editor.IPlayerUISession<ExtensionStorage>, tool: Editor.IModalTool, player: Server.Player, location: Server.Vector3 ) => {
    const targetBlock = player.dimension.getBlock( location );
    const pane = uiSession.createPropertyPane(
        {
            titleAltText: "Block Modifier",
            titleStringId: "",
            width: 40,
        },
    );
    
    const settings = Editor.bindDataSource(
        pane,
        {
            blockType: targetBlock.typeId,
            newBlockType: "minecraft:stone",
            location: targetBlock.location,
            waterlogged: targetBlock.isWaterlogged,
            weirdo_direction: targetBlock.permutation.getState( "weirdo_direction" ),
            direction: targetBlock.permutation.getState( "direction" ),
            lever_direction: targetBlock.permutation.getState( "lever_direction" ),
            brushed_progress: targetBlock.permutation.getState( "brushed_progress" ),
            growth: targetBlock.permutation.getState( "growth" ),
            redstone_signal: targetBlock.permutation.getState( "redstone_signal" ),
            repeater_delay: targetBlock.permutation.getState( "repeater_delay" ),
            rail_direction: targetBlock.permutation.getState( "rail_direction" ),
            damage: targetBlock.permutation.getState( "damage" ),
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

    pane.addVector3(
        settings,
        "location",
        {
            titleAltText: "Location",
            enable: false,
            minX: Number.MIN_SAFE_INTEGER,
            minY: Number.MIN_SAFE_INTEGER,
            minZ: Number.MIN_SAFE_INTEGER,
        },
    );

    pane.addDivider();
    pane.addBlockPicker( settings, "newBlockType", { titleAltText: "Block Type" } );
    pane.addButton(
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: async () => {
                    (<any>pane).dispose();

                    targetBlock.setType( settings.newBlockType );
                    if (settings.newBlockType != "minecraft:air") {
                        blockModifier( uiSession, tool, player, location );
                    };
                },
            },
        ),
        { titleAltText: "Change Type" },
    );

    pane.addDivider();
    
    if (Server.BlockTypes.get( targetBlock.typeId ).canBeWaterlogged) {
        pane.addBool(
            settings,
            "waterlogged",
            {
                titleAltText: "Waterlogged",
                onChange: () => {
                    targetBlock.isWaterlogged = settings.waterlogged;
                },
            },
        );
    };

    if (targetBlock.permutation.getState( "lever_direction" )) {
        pane.addDropdown(
            settings,
            "lever_direction",
            {
                titleAltText: "Lever Direction",
                dropdownItems: Server.BlockStates.get( "lever_direction" ).validValues.map(
                    (value) => (
                        {
                            displayAltText: value,
                            displayStringId: "",
                            value,
                        }
                    ),
                ) as Editor.IDropdownItem[],
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { lever_direction: settings.lever_direction } ),
                        );
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };
    
    if (targetBlock.permutation.getState( "redstone_signal" ) != undefined) {
        pane.addNumber(
            settings,
            "redstone_signal",
            {
                titleAltText: "Redstone Signal",
                min: 0,
                max: 15,
                showSlider: true,
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { redstone_signal: settings.redstone_signal } ),
                        );
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };

    if (targetBlock.permutation.getState( "repeater_delay" ) != undefined) {
        pane.addNumber(
            settings,
            "repeater_delay",
            {
                titleAltText: "Repeater Delay",
                min: 0,
                max: 3,
                showSlider: true,
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { repeater_delay: settings.repeater_delay } ),
                        );
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };

    if (
        targetBlock.permutation.getState( "weirdo_direction" ) != undefined
        || targetBlock.permutation.getState( "direction" ) != undefined
    ) {
        pane.addNumber(
            settings,
            (
                targetBlock.permutation.getState( "weirdo_direction" ) != undefined
                ? "weirdo_direction"
                : "direction"
            ),
            {
                titleAltText: "Direction",
                min: 0,
                max: 3,
                showSlider: true,
                onChange: () => {
                    try {
                        let direction = (
                            targetBlock.permutation.getState( "weirdo_direction" ) != undefined
                            ? { weirdo_direction: settings.weirdo_direction }
                            : { direction: settings.direction }
                        );

                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, direction ),
                        );
                    } catch(e) {};
                },
            }
        );
    };

    if (targetBlock.permutation.getState( "brushed_progress" ) != undefined) {
        pane.addNumber(
            settings,
            "brushed_progress",
            {
                titleAltText: "Brushed Progress",
                min: 0,
                max: 3,
                showSlider: true,
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { brushed_progress: settings.brushed_progress } ),
                        );
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };

    if (targetBlock.permutation.getState( "growth" ) != undefined) {
        pane.addNumber(
            settings,
            "growth",
            {
                titleAltText: "Growth",
                min: 0,
                max: 7,
                showSlider: true,
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { growth: settings.growth } ),
                        );  
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };

    if (targetBlock.permutation.getState( "rail_direction" ) != undefined) {
        pane.addNumber(
            settings,
            "rail_direction",
            {
                titleAltText: "Rail Direction",
                min: 0,
                max: 9,
                showSlider: true,
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { rail_direction: settings.rail_direction } ),
                        );
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };

    if (targetBlock.permutation.getState( "damage" )) {
        pane.addDropdown(
            settings,
            "damage",
            {
                titleAltText: "Damage",
                dropdownItems: Server.BlockStates.get( "damage" ).validValues.map(
                    (value) => (
                        {
                            displayAltText: value,
                            displayStringId: "",
                            value,
                        }
                    ),
                ) as Editor.IDropdownItem[],
                onChange: () => {
                    try {
                        targetBlock.setPermutation(
                            Server.BlockPermutation.resolve( targetBlock.typeId, { damage: settings.damage } ),
                        );
                    } catch(e) {
                        (<any>pane).dispose();
                    };
                },
            }
        );
    };

    tool.bindPropertyPane( pane );
    (<any>pane).update( true );
};