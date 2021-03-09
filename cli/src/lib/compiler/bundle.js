const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const { configFactory: rollupConfigFactory } = require('@dhis2/config-rollup')
const fs = require('fs-extra')
const rollup = require('rollup')
const {
    applyIndexTemplate,
    writeImportMap,
    generateImportMap,
    BatchWarnings,
} = require('./bundleHelpers.js')
const { generateRollupOptions } = require('./generateRollupOptions.js')
const AssetManagementPlugin = require('./RollupAssetManagementPlugin.js')
const { watchFiles } = require('./watchFiles.js')

const bundle = async ({ d2config, outDir, env, publicDir, watch, shell }) => {
    const configs = generateRollupOptions({
        d2config,
        outDir,
        env,
    })

    const assets = {}

    const warnings = new BatchWarnings()

    const timerLabel = '✨ Built all modules in'
    let isFirstBuild = true
    const bundlePromise = new Promise((resolve, reject) => {
        const watcher = rollup.watch(
            configs.map(config => {
                const options = rollupConfigFactory({ ...config, watch })
                options.onwarn = warning =>
                    warnings.add(Object.keys(options.input)[0], warning)
                options.plugins.push(new AssetManagementPlugin(assets, outDir))
                return options
            })
        )
        watcher.on('event', async ({ code, result, error }) => {
            if (result) {
                result.close()
            }
            if (code === 'START') {
                if (!isFirstBuild) {
                    console.clear()
                    reporter.print(chalk.dim('Changes detected, rebuilding...'))
                } else {
                    reporter.print(
                        chalk.dim(`Building ${configs.length} modules...`)
                    )
                }
                console.time(timerLabel)
            }
            if (code === 'END') {
                const importMap = generateImportMap(assets)
                const importMapFile = path.resolve(
                    outDir,
                    `systemjs-importmap.${env.MODE}.json`
                )
                await writeImportMap(importMap, importMapFile)

                await applyIndexTemplate(assets, {
                    srcDir: shell,
                    outDir,
                    importMap,
                    title: d2config.title,
                })

                warnings.flush()

                console.timeEnd(timerLabel)
                isFirstBuild = false

                if (!watch) {
                    watcher.close()
                    resolve()
                }
            }
            if (code === 'ERROR') {
                reject(error)
            }
        })

        process.on('SIGINT', async () => {
            watcher.close()
            reject('Caught interrupt signal')
        })
    })

    await Promise.all([
        bundlePromise,
        watchFiles({
            inputDir: shell,
            outputDir: outDir,
            processFileCallback: async (source, destination) => {
                if (path.relative(shell, source) === 'index.html') {
                    if (isFirstBuild) {
                        // TODO: handle in devServer
                        await fs.copyFile(
                            require.resolve(
                                '../../../config/index-placeholder.html'
                            ),
                            path.resolve(outDir, 'index.html')
                        )
                    } else {
                        await applyIndexTemplate(assets, {
                            srcDir: shell,
                            outDir,
                            importMap: generateImportMap(assets),
                            title: d2config.title,
                        })
                    }
                    return
                }
                await fs.copy(source, destination)
            },
            watch,
        }),
        watchFiles({
            inputDir: publicDir,
            outputDir: outDir,
            processFileCallback: async (source, destination) => {
                const relativePath = path.relative(publicDir, source)
                if (await fs.pathExists(path.join(shell, relativePath))) {
                    reporter.warn(
                        `Overriding shell file ${relativePath} is not supported.`
                    )
                    return
                }
                await fs.copy(source, destination)
            },
            watch,
        }),
    ])
}

module.exports = bundle
