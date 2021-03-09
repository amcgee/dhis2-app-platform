const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const buildAppArchive = require('../lib/buildAppArchive')
const { compile, bundle } = require('../lib/compiler')
const exitOnCatch = require('../lib/exitOnCatch')
const generateManifest = require('../lib/generateManifest')
const i18n = require('../lib/i18n')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const { validatePackage } = require('../lib/validatePackage')

const buildModes = ['development', 'production']

const getNodeEnv = () => {
    let nodeEnv = process.env['NODE_ENV']
    if (nodeEnv) {
        nodeEnv = nodeEnv.toLowerCase()
        if (buildModes.includes(nodeEnv)) {
            return nodeEnv
        }
    }
    return null
}

const printBuildParam = (key, value) => {
    reporter.print(chalk.green(` - ${key} :`), chalk.yellow(value))
}
const setAppParameters = (env, standalone, config) => {
    env.PUBLIC_URL = process.env.PUBLIC_URL || '.'
    printBuildParam('PUBLIC_URL', env.PUBLIC_URL)

    if (
        standalone === false ||
        (typeof standalone === 'undefined' && !config.standalone)
    ) {
        const defaultBase = config.coreApp ? `..` : `../../..`
        env.DHIS2_BASE_URL = process.env.DHIS2_BASE_URL || defaultBase

        printBuildParam('DHIS2_BASE_URL', env.DHIS2_BASE_URL)
    } else {
        printBuildParam('DHIS2_BASE_URL', '<standalone>')
    }
}

const filterEnv = () => {
    const env = {}
    for (const key of Object.keys(process.env)) {
        if (key.startsWith('DHIS2_')) {
            env[key] = process.env[key]
        }
        if (key.startsWith('REACT_APP_DHIS2_')) {
            const realKey = env.substr('REACT_APP_'.length)
            env[realKey] = process.env[key]
        }
    }
    return env
}

const handler = async ({
    cwd = process.cwd(),
    mode,
    dev,
    watch,
    standalone,
    verify,
    shell = undefined,
}) => {
    const paths = makePaths(cwd)

    mode = mode || (dev && 'development') || getNodeEnv() || 'production'
    loadEnvFiles(paths, mode)

    reporter.print(chalk.green.bold('Build parameters:'))
    printBuildParam('Mode', mode)

    const config = parseConfig(paths)

    const env = {
        ...filterEnv(),
        MODE: mode,
    }

    if (config.type === 'app') {
        setAppParameters(env, standalone, config)
    }

    await fs.remove(paths.buildOutput)

    await exitOnCatch(
        async () => {
            if (
                !(await validatePackage({
                    config,
                    paths,
                    offerFix: !process.env.CI,
                    noVerify: !verify,
                }))
            ) {
                reporter.error(
                    'Failed to validate package, use --no-verify to skip these checks'
                )
                process.exit(1)
            }

            reporter.info('Generating internationalization strings...')
            await i18n.extract({ input: paths.src, output: paths.i18nStrings })
            await i18n.generate({
                input: paths.i18nStrings,
                output: paths.i18nLocales,
                namespace: 'default',
            })

            reporter.info(
                `Building ${config.type} ${chalk.bold(config.name)}...`
            )

            if (config.type === 'app') {
                await bundle({
                    d2config: config,
                    outDir: paths.buildAppOutput,
                    env,
                    publicDir: paths.public,
                    shell: shell || paths.shellSource,
                    watch,
                })
            } else {
                await Promise.all([
                    compile({
                        config,
                        paths,
                        moduleType: 'es',
                        mode,
                        watch,
                    }),
                    compile({
                        config,
                        paths,
                        moduleType: 'cjs',
                        mode,
                        watch,
                    }),
                ])
            }
        },
        {
            name: 'build',
        }
    )

    if (config.type === 'app') {
        reporter.info('Generating manifest...')
        await generateManifest(paths, config, process.env.PUBLIC_URL)

        const appBundle = paths.buildAppBundle
            .replace(/{{name}}/, config.name)
            .replace(/{{version}}/, config.version)
        reporter.info(
            `Creating app archive at ${chalk.bold(
                path.relative(cwd, appBundle)
            )}...`
        )
        await buildAppArchive(paths.buildAppOutput, appBundle)

        reporter.print(chalk.green('\n**** DONE! ****'))
    }
}

const command = {
    aliases: 'b',
    desc: 'Build a production app bundle for use with the DHIS2 app-shell',
    builder: {
        mode: {
            description: 'Specify the target build environment',
            aliases: 'm',
            choices: buildModes,
            defaultDescription: 'production',
        },
        dev: {
            type: 'boolean',
            description: 'Build in development mode',
            conflicts: 'mode',
        },
        verify: {
            type: 'boolean',
            description: 'Validate package before building',
            default: true,
        },
        watch: {
            type: 'boolean',
            description: 'Watch source files for changes',
            default: false,
        },
        standalone: {
            type: 'boolean',
            description:
                'Build in standalone mode (overrides the d2.config.js setting)',
            default: undefined,
        },
    },
    handler,
}

module.exports = command
