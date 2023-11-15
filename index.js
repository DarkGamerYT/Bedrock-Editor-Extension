const fs = require( "node:fs" );
const crypto = require( "node:crypto" );
const archiver = require( "archiver" );

const addon = {
    name: "Editor Extension",
    description: "An extension for Editor Mode that adds useful tools.",
    version: [ 0, 2, 0 ],
};
const mcVersion = [ 1, 20, 50 ];
const uuids = {
    resourcePack: "8d00b185-8ab6-4960-9979-9d43f62b0c33",
    behaviorPack: "b84c3196-9f1b-462b-95e7-84c8590ccd72",
};

const dependencies = {
    resourcePack: [
        { uuid: uuids.behaviorPack, version: addon.version },
    ],
    behaviorPack: [
        { module_name: "@minecraft/server", version: "1.8.0-beta" },
        { module_name: "@minecraft/server-editor", version: "0.1.0-beta" },
        { module_name: "@minecraft/server-editor-bindings", version: "0.1.0-beta" },
        { uuid: uuids.resourcePack, version: addon.version },
    ],
};

(async () => {
    await fs.writeFileSync(
        __dirname + "/build/packs/Resource Pack/manifest.json",
        JSON.stringify(
            {
                format_version: 2,
                header: {
                    name: addon.name,
                    description: addon.description,
                    uuid: uuids.resourcePack,
                    version: addon.version,
                    min_engine_version: mcVersion,
                },
                modules: [
                    {
                        type: "resources",
                        uuid: crypto.randomUUID(),
                        version: [ 1, 0, 0 ],
                    },
                ],
                dependencies: dependencies.resourcePack,
            },
            null,
            4,
        ),
    );
    
    await fs.writeFileSync(
        __dirname + "/build/packs/Behavior Pack/manifest.json",
        JSON.stringify(
            {
                format_version: 2,
                header: {
                    name: addon.name,
                    description: addon.description,
                    uuid: uuids.behaviorPack,
                    version: addon.version,
                    min_engine_version: mcVersion,
                },
                modules: [
                    {
                        type: "script",
                        language: "javascript",
                        entry: "scripts/index.js",
                        uuid: crypto.randomUUID(),
                        version: [ 1, 0, 0 ],
                    },
                ],
                dependencies: dependencies.behaviorPack,
            },
            null,
            4,
        ),
    );

    try {
        await fs.rmSync( __dirname + "/build/Editor Extension.mceditoraddon" );
    } catch {};

    const output = fs.createWriteStream( __dirname + "/build/Editor Extension.mceditoraddon" );
    const archive = archiver( "zip" );
    archive.pipe( output );
    archive.directory( __dirname + "/build/packs", false );
    archive.finalize();
})();