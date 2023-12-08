import * as Editor from "@minecraft/server-editor";
import { Color } from "../../../../utils";
type ExtensionStorage = {
    currentCursorState: {
        outlineColor: Color,
        controlMode: Editor.CursorControlMode,
        targetMode: Editor.CursorTargetMode,
        visible: boolean,
        fixedModeDistance: number,
    },
};

export const Shutdown = ( uiSession: Editor.IPlayerUISession<ExtensionStorage> ) => {
    uiSession.log.debug( `Shutting down ${uiSession.extensionContext.extensionInfo.name} extension` );
};