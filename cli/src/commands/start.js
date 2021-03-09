const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const { bundle } = require('../lib/compiler')
const { serve } = require('../lib/devServer')
const exitOnCatch = require('../lib/exitOnCatch')
const i18n = require('../lib/i18n')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const { validatePackage } = require('../lib/validatePackage')

const defaultPort = 3000

const handler = async ({
    cwd,
    shell = undefined,
    port = process.env.PORT || defaultPort,
}) => {
    const paths = makePaths(cwd)

    const mode = 'development'
    loadEnvFiles(paths, mode)

    const config = parseConfig(paths)

    if (config.type !== 'app') {
        reporter.error(
            `The command ${chalk.bold(
                'd2-app-scripts start'
            )} is not currently supported for libraries!`
        )
        process.exit(1)
    }

    await exitOnCatch(
        async () => {
            if (!(await validatePackage({ config, paths, offerFix: false }))) {
                reporter.print(
                    'Package validation issues are ignored when running "d2-app-scripts start"'
                )
                reporter.print(
                    `${chalk.bold(
                        'HINT'
                    )}: Run "d2-app-scripts build" to automatically fix some of these issues`
                )
            }

            reporter.info('Generating internationalization strings...')
            await i18n.extract({ input: paths.src, output: paths.i18nStrings })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: 'default',
            })

            // TODO: build to virtual FS or clear exsting build dir?
            const outDir = paths.buildAppOutput
            await Promise.all([
                bundle({
                    d2config: config,
                    outDir,
                    env: {
                        MODE: mode,
                    },
                    publicDir: paths.public,
                    shell: shell || paths.shellSource,
                    watch: true,
                }),
                serve(outDir, { name: config.name, port }),
            ])
        },
        {
            name: 'start',
        }
    )
}

const command = {
    command: 'start',
    aliases: 's',
    desc:
        'Start a development server running a DHIS2 app within the DHIS2 app-shell',
    builder: {
        port: {
            alias: 'p',
            type: 'number',
            description: 'The port to use when running the development server',
        },
    },
    handler,
}

module.exports = command
