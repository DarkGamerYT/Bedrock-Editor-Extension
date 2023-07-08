import * as Server from "@minecraft/server";
import * as Editor from "@minecraft/server-editor";
const TicksRefreshRate = 5;
const dimensions = {
    "minecraft:overworld": "Overworld",
    "minecraft:nether": "The Nether",
    "minecraft:the_end": "The End",
};

type ExtensionStorage = {
    isDisposed: boolean,
    latestRunId: number,
};

const areLocationsEqual = (a: Server.Vector3, b: Server.Vector3) => a.x === b.x && a.y === b.y && a.z === b.z;
export const Start = (uiSession: import("@minecraft/server-editor").IPlayerUISession<ExtensionStorage>) => {
    console.log(`Initializing ${uiSession.extensionContext.extensionName} extension`);
    uiSession.scratchStorage = {
        isDisposed: false,
        latestRunId: -1
    };

    const player = uiSession.extensionContext.player;
    let currentLocation = {
        ...player.location
    };

    const positionStatusItem = uiSession.createStatusBarItem(Editor.EditorStatusBarAlignment.Left, 30);
    positionStatusItem.text = `Position: (${Math.floor(currentLocation.x)} / ${Math.floor(currentLocation.y)} / ${Math.floor(currentLocation.z)})`;

    const dimensionStatusItem = uiSession.createStatusBarItem(Editor.EditorStatusBarAlignment.Right, 30);
    dimensionStatusItem.text = `Dimension: ${dimensions[player.dimension.id]}`;
    let ticks = 0;
    const onTick = () => {
        if (ticks++ % TicksRefreshRate === 0 && !areLocationsEqual(player.location, currentLocation)) {
            ticks = 0;
            currentLocation = {
                ...player.location
            };

            positionStatusItem.text = `Position: (${Math.floor(currentLocation.x)} / ${Math.floor(currentLocation.y)} / ${Math.floor(currentLocation.z)})`;
            dimensionStatusItem.text = `Dimension: ${dimensions[player.dimension.id]}`;
        };

        if (uiSession.scratchStorage && !uiSession.scratchStorage.isDisposed) {
            uiSession.scratchStorage.latestRunId = Server.system.run(onTick);
        };
    };
    uiSession.scratchStorage.latestRunId = Server.system.run(onTick);
    return [];
};