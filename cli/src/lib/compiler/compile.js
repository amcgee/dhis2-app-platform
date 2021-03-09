const path = require('path')
const babel = require('@babel/core')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const babelConfigFactory = require('@dhis2/config-babel/configFactory')
const fs = require('fs-extra')
const {
    extensionPattern,
    normalizeExtension,
} = require('./extensionHelpers.js')
const { watchFiles } = require('./watchFiles.js')

const overwriteEntrypoint = async ({ config, paths }) => {
    const isApp = config.type === 'app'
    const entrypoint = isApp ? config.entryPoints.app : config.entryPoints.lib
    if (!entrypoint.match(/^(\.\/)?src\//)) {
        const msg = `App entrypoint ${chalk.bold(
            entrypoint
        )} must be located within the ${chalk.bold('./src')} directory`
        reporter.error(msg)
        throw new Error(msg)
    }

    const relativeEntrypoint = entrypoint.replace(/^(\.\/)?src\//, '')

    try {
        require.resolve(path.join(paths.base, entrypoint))
    } catch (e) {
        const msg = `Could not resolve app entrypoint ${chalk.bold(entrypoint)}`
        reporter.error(msg)
        throw new Error(msg)
    }

    const outRelativeEntrypoint = normalizeExtension(relativeEntrypoint)

    if (isApp) {
        const shellAppSource = await fs.readFile(paths.shellSourceEntrypoint)
        await fs.writeFile(
            paths.shellAppEntrypoint,
            shellAppSource
                .toString()
                .replace(
                    /'.\/D2App\/app'/g,
                    `'./D2App/${outRelativeEntrypoint}'`
                )
        )
    }
}

const compile = async ({
    config,
    paths,
    moduleType = 'es',
    mode = 'development',
    watch = false,
}) => {
    await overwriteEntrypoint({ config, paths })

    const isApp = config.type === 'app'
    const outDir = isApp
        ? paths.shellApp
        : path.join(paths.buildOutput, moduleType)

    fs.removeSync(outDir)
    fs.ensureDirSync(outDir)

    if (isApp) {
        fs.removeSync(paths.shellPublic)
        fs.copySync(paths.shellSourcePublic, paths.shellPublic)
    }

    const babelConfig = babelConfigFactory({ mode, moduleType })

    const copyFile = async (source, destination) => {
        await fs.copy(source, destination)
    }
    const compileFile = async (source, destination) => {
        if (source.match(extensionPattern)) {
            const result = await babel.transformFileAsync(source, babelConfig)
            await fs.writeFile(destination, result.code)
        } else {
            await copyFile(source, destination)
        }
    }

    return Promise.all([
        watchFiles({
            inputDir: paths.src,
            outputDir: outDir,
            processFileCallback: compileFile,
            watch,
        }),
        isApp &&
            watchFiles({
                inputDir: paths.public,
                outputDir: paths.shellPublic,
                processFileCallback: copyFile,
                watch,
            }),
    ])
}

module.exports = compile
