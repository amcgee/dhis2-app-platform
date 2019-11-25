const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const babel = require('@babel/core')

const babelOptions = require('../../../config/app.babel.config')

const overwriteEntrypoint = async ({ config, paths }) => {
    const shellAppSource = await fs.readFile(paths.shellSourceEntrypoint)

    const entrypoint = config.entryPoints.app
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

    await fs.writeFile(
        paths.shellAppEntrypoint,
        shellAppSource
            .toString()
            .replace(/'.\/D2App\/app'/g, `'./D2App/${relativeEntrypoint}'`)
    )
}

const compileApp = async ({ config, paths, mode, watch }) => {
    const inputDir = paths.src
    const outputDir = paths.shellApp

    await overwriteEntrypoint({ config, paths })

    fs.removeSync(outputDir)
    fs.ensureDirSync(outputDir)

    const compileFile = async source => {
        const relative = path.relative(inputDir, source)
        const destination = path.join(outputDir, relative)
        reporter.debug(
            `File ${relative} changed or added... dest: `,
            path.relative(paths.base, destination)
        )
        await fs.ensureDir(path.dirname(destination))
        if (path.extname(source) === '.js') {
            const result = await babel.transformFileAsync(source, babelOptions)
            await fs.writeFile(destination, result.code)
        } else {
            await fs.copy(source, destination)
        }
    }

    const removeFile = async file => {
        const relative = path.relative(inputDir, file)
        const outFile = path.join(outputDir, relative)
        reporter.debug(`File ${relative} removed... removing: `, outFile)
        fs.remove(outFile)
    }

    return new Promise((resolve, reject) => {
        const watcher = chokidar.watch(inputDir, { persistent: true })

        watcher
            .on('ready', async () => {
                if (watch) {
                    reporter.debug('watching...')
                } else {
                    await watcher.close()
                }
                resolve()
            })
            .on('add', compileFile)
            .on('change', compileFile)
            .on('unlink', removeFile)
            .on('error', error => {
                reporter.debugError('Chokidar error:', error)
                reject('Chokidar error!')
            })

        process.on('SIGINT', async () => {
            reporter.debug('Caught interrupt signal')
            await watcher.close()
        })
    })
}

module.exports = compileApp
