const fs = require( "node:fs" );
const crypto = require( "node:crypto" );

const addonVersion = "0.1.6-alpha";
const mcVersion = [ 1, 20, 20 ];
const uuids = {
    resourcePack: "8d00b185-8ab6-4960-9979-9d43f62b0c33",
    behaviorPack: "b84c3196-9f1b-462b-95e7-84c8590ccd72",
};

const dependencies = {
    resourcePack: [
        { uuid: uuids.behaviorPack, version: addonVersion },
    ],
    behaviorPack: [
        { module_name: "@minecraft/server", version: "1.5.0-beta" },
        { module_name: "@minecraft/server-editor", version: "0.1.0-beta" },
        { module_name: "@minecraft/server-editor-bindings", version: "0.1.0-beta" },
        { uuid: uuids.resourcePack, version: addonVersion },
    ],
};

fs.writeFileSync(
    "./build/Resource Pack/manifest.json",
    JSON.stringify(
        {
            format_version: 2,
            header: {
                name: "Editor Extension",
                description: "An extension for Editor Mode that adds useful tools.",
                uuid: uuids.resourcePack,
                version: addonVersion,
                min_engine_version: mcVersion,
            },
            modules: [
                {
                    type: "resources",
                    uuid: crypto.randomUUID(),
                    version: [ 1, 0, 0 ]
                },
            ],
            dependencies: dependencies.resourcePack,
        },
        null,
        4,
    ),
);

fs.writeFileSync(
    "./build/Behavior Pack/manifest.json",
    JSON.stringify(
        {
            format_version: 2,
            header: {
                name: "Editor Extension",
                description: "An extension for Editor Mode that adds useful tools.",
                uuid: uuids.behaviorPack,
                version: addonVersion,
                min_engine_version: mcVersion,
            },
            modules: [
                {
                    type: "script",
                    language: "javascript",
			        entry: "scripts/index.js",
                    uuid: crypto.randomUUID(),
                    version: [ 1, 0, 0 ]
                },
            ],
            dependencies: dependencies.behaviorPack,
        },
        null,
        4,
    ),
);