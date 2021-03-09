const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const archiver = require('archiver')
const fs = require('fs-extra')

module.exports = (inDir, outFile) => {
    return new Promise((resolve, reject) => {
        fs.ensureDirSync(path.dirname(outFile))
        const output = fs.createWriteStream(outFile)

        const archive = archiver('zip', {
            zlib: { level: 9 },
        })

        output.on('close', function () {
            reporter.print(chalk.dim(`Total size: ${archive.pointer()} bytes`))
            resolve()
        })

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                reporter.warn('[bundler]', err)
            } else {
                reject(err)
            }
        })

        archive.on('error', function (err) {
            reject(err)
        })

        archive.pipe(output)
        archive.directory(inDir, false)
        archive.finalize()
    })
}
