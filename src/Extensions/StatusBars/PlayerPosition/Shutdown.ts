import * as Server from "@minecraft/server";
type ExtensionStorage = {
    isDisposed: boolean,
    latestRunId: number,
};

export const Shutdown = (uiSession: import("@minecraft/server-editor").IPlayerUISession<ExtensionStorage>) => {
    if (
        uiSession.scratchStorage
        && uiSession.scratchStorage.latestRunId !== -1
    ) {
        uiSession.scratchStorage.isDisposed = true;
        Server.system.clearRun(uiSession.scratchStorage.latestRunId);
    };
    
    uiSession.log.debug( `Shutting down ${uiSession.extensionContext.extensionName} extension` );
};