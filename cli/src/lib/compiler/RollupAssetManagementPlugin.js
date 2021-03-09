const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

function AssetManagementPlugin(assets, outDir) {
    return {
        name: 'import-map',
        async writeBundle(options, bundle) {
            for (const chunkOrAsset of Object.values(bundle)) {
                const { name, type, isEntry } = chunkOrAsset
                if (name) {
                    const assetPath =
                        './' +
                        path.relative(
                            outDir,
                            path.join(options.dir, chunkOrAsset.fileName)
                        )
                    if (
                        assets[name] &&
                        assets[name].path &&
                        assets[name].path !== assetPath
                    ) {
                        const oldAssetPath = path.resolve(
                            outDir,
                            assets[name].path
                        )
                        reporter.debug(
                            `Deleting superceded file ${path.relative(
                                outDir,
                                oldAssetPath
                            )}`
                        )
                        await fs.remove(oldAssetPath)
                        const mapFile = oldAssetPath + '.map'
                        if (await fs.pathExists(mapFile)) {
                            reporter.debug(
                                `Deleting superceded sourcemap ${path.relative(
                                    outDir,
                                    mapFile
                                )}`
                            )
                            await fs.remove(mapFile)
                        }
                    }

                    reporter.debug(
                        `Generated bundle asset ${name} (type: ${type}, isEntry: ${isEntry}, format: ${options.format}) at ${assetPath}`
                    )
                    assets[name] = {
                        name,
                        type,
                        isEntry,
                        format: options.format,
                        path: assetPath,
                    }
                }
            }
        },
    }
}

module.exports = AssetManagementPlugin
