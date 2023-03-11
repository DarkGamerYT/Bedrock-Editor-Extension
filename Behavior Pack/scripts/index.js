import * as Editor from "@minecraft/server-editor";

//Tools
import CylinderTool from "./Extensions/CylinderTool";
import SphereTool from "./Extensions/SphereTool";
import CubeTool from "./Extensions/CubeTool";

import StructurePlacerTool from "./Extensions/StructurePlacerTool";
import ReplaceBlocksTool from "./Extensions/ReplaceBlocksTool";
import EntitySpawnerTool from "./Extensions/EntitySpawnerTool";

Editor.registerEditorExtension("cylinderTool", CylinderTool);
Editor.registerEditorExtension("sphereTool", SphereTool);
Editor.registerEditorExtension("cubeBrush", CubeTool);

Editor.registerEditorExtension("divider", uiSession => uiSession.toolRail.addTool({ displayString: "Divider", icon: "pack://textures/editor/divider.png?filtering=point" }));

Editor.registerEditorExtension("entitySpawnerTool", EntitySpawnerTool);
Editor.registerEditorExtension("structurePlacerTool", StructurePlacerTool);
Editor.registerEditorExtension("replaceBlocksTool", ReplaceBlocksTool);