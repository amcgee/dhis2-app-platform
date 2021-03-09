const { reporter } = require('@dhis2/cli-helpers-engine')
const defaultJestConfig = require('@dhis2/config-jest')
const fs = require('fs-extra')
const { runCLI } = require('jest-cli')
const exitOnCatch = require('../lib/exitOnCatch')
const loadEnvFiles = require('../lib/loadEnvFiles')
const makePaths = require('../lib/paths')

const handler = async ({
    verbose,
    cwd,
    testRegex,
    update,
    coverage,
    watch,
    watchAll,
}) => {
    const paths = makePaths(cwd)

    const mode = (process.env.NODE_ENV = process.env.BABEL_ENV = 'test')
    loadEnvFiles(paths, mode)

    reporter.info('Running tests...')

    await exitOnCatch(
        async () => {
            const appJestConfig = fs.existsSync(paths.jestConfig)
                ? require(paths.jestConfig)
                : {}
            const pkgJestConfig = require(paths.package).jest

            const jestConfig = {
                roots: ['./src'],
                ...defaultJestConfig,
                ...appJestConfig,
                ...pkgJestConfig,
            }

            reporter.debug('Resolved jest config', jestConfig)

            const ci = process.env.CI

            const result = await runCLI(
                {
                    testPathPattern: testRegex,
                    config: JSON.stringify(jestConfig),
                    updateSnapshot: !ci && update,
                    collectCoverage: coverage,
                    watch: (!ci && watch) || undefined,
                    watchAll: (!ci && watchAll) || undefined,
                    ci,
                    verbose: verbose,
                },
                [paths.base]
            )

            if (result.results.success) {
                reporter.info(`Tests completed`)
            } else {
                reporter.error(`Tests failed`)
                process.exit(1)
            }
        },
        {
            name: 'test',
            onError: () =>
                reporter.error('Test script exited with non-zero exit code'),
        }
    )
}

const command = {
    command: 'test [testRegex]',
    aliases: 't',
    desc: 'Run application unit tests',
    builder: {
        updateSnapshot: {
            type: 'boolean',
            desc: 'Update jest snapshots',
            aliases: 'u',
            default: false,
        },
        coverage: {
            type: 'boolean',
            desc: 'Collect test coverage',
            default: false,
        },
        watch: {
            type: 'boolean',
            desc: 'Watch modified source files for changes',
            alias: 'w',
            default: false,
        },
        watchAll: {
            type: 'boolean',
            desc: 'Watch all source files for changes',
            default: false,
        },
    },
    handler,
}

module.exports = command
