export default (uiSession: import("@minecraft/server-editor").IPlayerUISession) => {
    uiSession.toolRail.addTool(
        {
            displayAltText: "Divider",
            icon: "pack://textures/editor/divider.png?filtering=point",
        },
    );
    
    return [];
};