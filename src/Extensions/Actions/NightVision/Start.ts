import * as Editor from "@minecraft/server-editor";
export const Start = ( uiSession: Editor.IPlayerUISession ) => {
    const menu = uiSession.createMenu({ name: "Night Vision" });
    
    menu.addItem(
        { name: "Enable" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.addEffect( "night_vision", 20000000, { amplifier: 1, showParticles: false } ),
            },
        ),
    );

    menu.addItem(
        { name: "Disable" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.removeEffect( "night_vision" ),
            },
        ),
    );

    return [];
};