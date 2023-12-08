import * as Editor from "@minecraft/server-editor";
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
Editor.registerEditorExtension( "PyramidBrush", PyramidBrush.Start, PyramidBrush.Shutdown, { toolGroupId: "brushes" } );
Editor.registerEditorExtension( "CylinderBrush", CylinderBrush.Start, CylinderBrush.Shutdown, { toolGroupId: "brushes" } );
Editor.registerEditorExtension( "SphereBrush", SphereBrush.Start, SphereBrush.Shutdown, { toolGroupId: "brushes" } );
Editor.registerEditorExtension( "CubeBrush", CubeBrush.Start, CubeBrush.Shutdown, { toolGroupId: "brushes" } );
//Structures
Editor.registerEditorExtension( "StructurePlacer", StructurePlacer.Start, StructurePlacer.Shutdown, { toolGroupId: "structures" } );
Editor.registerEditorExtension( "StructureSaver", StructureSaver.Start, StructureSaver.Shutdown, { toolGroupId: "structures" } );
//Spawners
//Editor.registerEditorExtension( "EntitySpawner", EntitySpawner.Start, EntitySpawner.Shutdown, { toolGroupId: "spawners" } );
//Editor.registerEditorExtension( "ItemSpawner", ItemSpawner.Start, ItemSpawner.Shutdown, { toolGroupId: "spawners" } );
//Extras
Editor.registerEditorExtension( "BlocksCounter", BlocksCounter.Start, BlocksCounter.Shutdown, { toolGroupId: "extras" } );
Editor.registerEditorExtension( "BlockModifier", BlockModifier.Start, BlockModifier.Shutdown, { toolGroupId: "extras" } );
Editor.registerEditorExtension( "BlocksReplacer", BlocksReplacer.Start, BlocksReplacer.Shutdown, { toolGroupId: "extras" } );

//Actions
import * as NightVision from "./Extensions/Actions/NightVision/index";
import * as WorldSettings from "./Extensions/Actions/WorldSettings/index";
Editor.registerEditorExtension( "NightVision", NightVision.Start, NightVision.Shutdown );
Editor.registerEditorExtension( "WorldSettings", WorldSettings.Start, WorldSettings.Shutdown );

//StatusBars
import * as PlayerPosition from "./Extensions/StatusBars/PlayerPosition/index";
Editor.registerEditorExtension( "PlayerPosition", PlayerPosition.Start, PlayerPosition.Shutdown );