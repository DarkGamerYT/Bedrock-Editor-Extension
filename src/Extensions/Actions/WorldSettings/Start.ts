import * as Editor from "@minecraft/server-editor";
import * as Server from "@minecraft/server";
export const Start = (uiSession: import("@minecraft/server-editor").IPlayerUISession) => {
    const menu = uiSession.createMenu({ name: "World Settings" });
    const weather = menu.addItem({ name: "Weather" });
    weather.addItem(
        { name: "Clear" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.setWeather( Server.WeatherType.Clear ),
            },
        ),
    );
    
    weather.addItem(
        { name: "Rain" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.setWeather( Server.WeatherType.Rain ),
            },
        ),
    );

    weather.addItem(
        { name: "Thunder" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.setWeather( Server.WeatherType.Thunder ),
            },
        ),
    );

    const time = menu.addItem({ name: "Time" });
    time.addItem(
        { name: "Sunrise" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.runCommand( "time set sunrise" ),
            },
        ),
    );

    time.addItem(
        { name: "Day" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.runCommand( "time set day" ),
            },
        ),
    );

    time.addItem(
        { name: "Noon" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.runCommand( "time set noon" ),
            },
        ),
    );

    time.addItem(
        { name: "Sunset" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.runCommand( "time set sunset" ),
            },
        ),
    );

    time.addItem(
        { name: "Night" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.runCommand( "time set night" ),
            },
        ),
    );

    time.addItem(
        { name: "Midnight" },
        uiSession.actionManager.createAction(
            {
                actionType: Editor.ActionTypes.NoArgsAction,
                onExecute: () => uiSession.extensionContext.player.dimension.runCommand( "time set midnight" ),
            },
        ),
    );

    return [];
};