const http = require('http')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const detectPort = require('detect-port')
const handler = require('serve-handler')

module.exports.serve = async (dir, { name, port }) => {
    const newPort = await detectPort(port)
    if (String(newPort) !== String(port)) {
        reporter.print('')
        reporter.warn(
            `Something is already running on port ${port}, using ${newPort} instead.`
        )
    }

    reporter.print('')
    reporter.info('Starting development server...')

    const server = http.createServer((request, response) => {
        // You pass two more arguments for config and middleware
        // More details here: https://github.com/vercel/serve-handler#options
        return handler(request, response, {
            public: dir,
        })
    })

    server.listen(newPort, () => {
        reporter.print(
            `The app ${chalk.bold(name)} is now available on port ${newPort}`
        )
    })

    // TODO: open browser
    // TODO: HMR
}
