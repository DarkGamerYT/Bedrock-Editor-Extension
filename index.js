import * as Editor from "@minecraft/server-editor";

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
//import CoreEditor from "./Extensions/CoreEditor";

Editor.registerEditorExtension("cylinderTool", CylinderTool);
Editor.registerEditorExtension("sphereTool", SphereTool);
Editor.registerEditorExtension("cubeBrush", CubeTool);

Editor.registerEditorExtension("divider_", uiSession => uiSession.toolRail.addTool({ displayString: "Divider", icon: "pack://textures/editor/divider.png?filtering=point" }));

Editor.registerEditorExtension("structurePlacerTool", StructurePlacerTool);
Editor.registerEditorExtension("structureSaverTool", StructureSaverTool);

Editor.registerEditorExtension("divider", uiSession => uiSession.toolRail.addTool({ displayString: "Divider", icon: "pack://textures/editor/divider.png?filtering=point" }));

Editor.registerEditorExtension("blockModifier", BlockModifierTool);
Editor.registerEditorExtension("entitySpawnerTool", EntitySpawnerTool);
Editor.registerEditorExtension("itemSpawnerTool", ItemSpawnerTool);
Editor.registerEditorExtension("replaceBlocksTool", ReplaceBlocksTool);
//Editor.registerEditorExtension("CoreEditor", CoreEditor);