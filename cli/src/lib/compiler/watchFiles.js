const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const chokidar = require('chokidar')
const fs = require('fs-extra')
const { normalizeExtension } = require('./extensionHelpers.js')

module.exports.watchFiles = ({
    inputDir,
    outputDir,
    processFileCallback,
    watch,
}) => {
    const compileFile = async source => {
        const relative = normalizeExtension(path.relative(inputDir, source))
        const destination = path.join(outputDir, relative)
        reporter.debug(
            `File ${relative} changed or added... dest: `,
            path.relative(inputDir, destination)
        )
        await fs.ensureDir(path.dirname(destination))
        await processFileCallback(source, destination)
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
                reporter.debugErr('Chokidar error:', error)
                reject('Chokidar error!')
            })

        process.on('SIGINT', async () => {
            reporter.debug('Caught interrupt signal')
            await watcher.close()
        })
    })
}
