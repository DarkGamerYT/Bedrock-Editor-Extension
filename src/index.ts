import * as Editor from "@minecraft/server-editor";
import Divider from "./Extensions/Divider";
//Tools
import * as PyramidBrush from "./Extensions/Tools/Brushes/Pyramid/index";
import * as CylinderBrush from "./Extensions/Tools/Brushes/Cylinder/index";
import * as SphereBrush from "./Extensions/Tools/Brushes/Sphere/index";
import * as CubeBrush from "./Extensions/Tools/Brushes/Cube/index";
import * as StructurePlacer from "./Extensions/Tools/Structures/StructurePlacer/index";
import * as StructureSaver from "./Extensions/Tools/Structures/StructureSaver/index";
import * as EntitySpawner from "./Extensions/Tools/Spawners/EntitySpawner/index";
import * as ItemSpawner from "./Extensions/Tools/Spawners/ItemSpawner/index";
import * as BlocksCounter from "./Extensions/Tools/BlocksCounter/index";
import * as BlockModifier from "./Extensions/Tools/BlockModifier/index";
import * as BlocksReplacer from "./Extensions/Tools/BlocksReplacer/index";
//Brushes
Editor.registerEditorExtension( "PyramidBrush", PyramidBrush.Start, PyramidBrush.Shutdown );
Editor.registerEditorExtension( "CylinderBrush", CylinderBrush.Start, CylinderBrush.Shutdown );
Editor.registerEditorExtension( "SphereBrush", SphereBrush.Start, SphereBrush.Shutdown );
Editor.registerEditorExtension( "CubeBrush", CubeBrush.Start, CubeBrush.Shutdown );
//Divider
Editor.registerEditorExtension( "divider_", Divider, () => {} );
//Structures
Editor.registerEditorExtension( "StructurePlacer", StructurePlacer.Start, StructurePlacer.Shutdown );
Editor.registerEditorExtension( "StructureSaver", StructureSaver.Start, StructureSaver.Shutdown );
//Divider
Editor.registerEditorExtension( "divider__", Divider, () => {} );
//Spawners
Editor.registerEditorExtension( "EntitySpawner", EntitySpawner.Start, EntitySpawner.Shutdown );
Editor.registerEditorExtension( "ItemSpawner", ItemSpawner.Start, ItemSpawner.Shutdown );
//Divider
Editor.registerEditorExtension( "_divider_", Divider, () => {} );
Editor.registerEditorExtension( "BlocksCounter", BlocksCounter.Start, BlocksCounter.Shutdown );
Editor.registerEditorExtension( "BlockModifier", BlockModifier.Start, BlockModifier.Shutdown );
Editor.registerEditorExtension( "BlocksReplacer", BlocksReplacer.Start, BlocksReplacer.Shutdown );

//Actions
import * as NightVision from "./Extensions/Actions/NightVision/index";
import * as WorldSettings from "./Extensions/Actions/WorldSettings/index";
Editor.registerEditorExtension( "NightVision", NightVision.Start, NightVision.Shutdown );
Editor.registerEditorExtension( "WorldSettings", WorldSettings.Start, WorldSettings.Shutdown );

//StatusBars
import * as PlayerPosition from "./Extensions/StatusBars/PlayerPosition/index";
Editor.registerEditorExtension( "PlayerPosition", PlayerPosition.Start, PlayerPosition.Shutdown );