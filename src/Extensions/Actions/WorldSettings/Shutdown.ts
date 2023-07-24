export const Shutdown = ( uiSession: import( "@minecraft/server-editor" ).IPlayerUISession ) => {
    uiSession.log.debug( `Shutting down ${uiSession.extensionContext.extensionName} extension` );
};