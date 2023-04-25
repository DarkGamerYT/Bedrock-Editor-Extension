import * as Editor from "@minecraft/server-editor";
import * as Server from "@minecraft/server";

//Tools
import CylinderTool from "./Extensions/CylinderTool";
import SphereTool from "./Extensions/SphereTool";
import CubeTool from "./Extensions/CubeTool";

import StructurePlacerTool from "./Extensions/StructurePlacerTool";
import StructureSaverTool from "./Extensions/StructureSaverTool";

import BlockModifierTool from "./Extensions/BlockModifierTool";
import EntitySpawnerTool from "./Extensions/EntitySpawnerTool";
import ItemSpawnerTool from "./Extensions/ItemSpawnerTool";
import ReplaceBlocksTool from "./Extensions/ReplaceBlocksTool";
import BlocksCounterTool from "./Extensions/BlocksCounterTool";
//import CoreEditor from "./Extensions/CoreEditor";

Editor.registerEditorExtension("cylinderTool", CylinderTool);
Editor.registerEditorExtension("sphereTool", SphereTool);
Editor.registerEditorExtension("cubeBrush", CubeTool);

Editor.registerEditorExtension("divider", uiSession => uiSession.toolRail.addTool({ displayString: "Divider", icon: "pack://textures/editor/divider.png?filtering=point" }));

Editor.registerEditorExtension("blocksCounterTool", BlocksCounterTool);

Editor.registerEditorExtension("divider_", uiSession => uiSession.toolRail.addTool({ displayString: "Divider", icon: "pack://textures/editor/divider.png?filtering=point" }));

Editor.registerEditorExtension("structurePlacerTool", StructurePlacerTool);
Editor.registerEditorExtension("structureSaverTool", StructureSaverTool);

Editor.registerEditorExtension("divider__", uiSession => uiSession.toolRail.addTool({ displayString: "Divider", icon: "pack://textures/editor/divider.png?filtering=point" }));

Editor.registerEditorExtension("blockModifier", BlockModifierTool);
Editor.registerEditorExtension("entitySpawnerTool", EntitySpawnerTool);
Editor.registerEditorExtension("itemSpawnerTool", ItemSpawnerTool);
Editor.registerEditorExtension("replaceBlocksTool", ReplaceBlocksTool);
//Editor.registerEditorExtension("CoreEditor", CoreEditor);

Server.world.events.chatSend.subscribe(
    ({ sender: player, message }) => {
        if (!message.startsWith( "!" )) return;
        const command = message.split( " " )[0].slice(1);
        switch (command) {
            case "test":

            break;
        };

        const inventory = player.getComponent( "inventory" ).container;
        const itemInHand = inventory.getItem( player.selectedSlot );

        const equipment = player.getComponent( "equipment_inventory" );
        equipment.setEquipment( Server.EquipmentSlot.offhand, new Server.ItemStack("minecraft:dirt") );
    },
);