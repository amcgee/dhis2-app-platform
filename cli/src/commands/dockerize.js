const { reporter } = require('@dhis2/cli-helpers-engine')
const exitOnCatch = require('../lib/exitOnCatch')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const makeShell = require('../lib/shell')

const handler = async ({ cwd }) => {
    const paths = makePaths(cwd)

    const mode = 'development'
    loadEnvFiles(paths, mode)

    const config = parseConfig(paths)
    const shell = makeShell({ config, paths })

    const registry = 'dhis2'
    const appName = paths.base.split(/[\\/]/).pop()
    const dockerImage = `${registry}/${appName}`
    const dockerTag = 'standalone'

    await exitOnCatch(
        async () => {
            reporter.info('Building docker image...')
            await shell.dockerBuild({ image: dockerImage, tag: dockerTag })
        },
        {
            name: 'dockerize',
            onError: () =>
                reporter.error(
                    'Dockerize script exited with non-zero exit code'
                ),
        }
    )
}

const command = {
    command: 'dockerize',
    desc: 'Build and push docker image',
    handler,
}

module.exports = command
