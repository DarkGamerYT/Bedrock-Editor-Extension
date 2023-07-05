import * as Editor from "@minecraft/server-editor";
import * as VanillaData from "@minecraft/vanilla-data";
export const Start = (uiSession: import("@minecraft/server-editor").IPlayerUISession) => {
    const menu = uiSession.createMenu(
        { name: "Night Vision" },
    );
    
    menu.addItem(
        { name: "Enable" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.addEffect( VanillaData.MinecraftEffectTypes.NightVision, 20000000, { amplifier: 1, showParticles: false } ),
            },
        ),
    );

    menu.addItem(
        { name: "Disable" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.removeEffect( VanillaData.MinecraftEffectTypes.NightVision ),
            },
        ),
    );

    return [];
};