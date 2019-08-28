const { reporter, exec } = require('@dhis2/cli-helpers-engine')
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

const makePaths = require('../lib/paths')

const handler = async ({ force, name, cwd, lib }) => {
    cwd = cwd || process.cwd()
    cwd = path.join(cwd, name)
    fs.mkdirpSync(cwd)
    const paths = makePaths(cwd)

    if (fs.existsSync(paths.config) && !force) {
        reporter.warn(
            'A config file already exists, use --force to overwrite it'
        )
    } else {
        reporter.info('Importing d2.config.js defaults')
        fs.copyFileSync(
            lib ? paths.configDefaultsLib : paths.configDefaultsApp,
            paths.config
        )
    }

    if (!fs.existsSync(paths.package)) {
        reporter.info('No package.json found, creating one...')

        const pkg = require(path.join(
            __dirname,
            '../../config/init.package.json'
        ))
        pkg.name = name
        fs.writeJSONSync(paths.package, pkg, {
            spaces: 2,
        })
    }

    reporter.info('Creating package scripts...')
    const pkg = require(paths.package)
    if (pkg.scripts && pkg.scripts.build && !force) {
        reporter.warn(
            'A script called "build" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.build = 'd2-app-scripts build'
    }

    if (pkg.scripts && pkg.scripts.start && !force) {
        reporter.warn(
            'A script called "start" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.start = 'd2-app-scripts start'
    }

    if (pkg.scripts && pkg.scripts.test && !force) {
        reporter.warn(
            'A script called "test" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.test = 'd2-app-scripts test'
    }

    fs.writeJSONSync(paths.package, pkg, {
        spaces: 2,
    })

    if (
        !force &&
        ((pkg.devDependencies &&
            Object.keys(pkg.devDependencies).includes(
                '@dhis2/cli-app-scripts'
            )) ||
            (pkg.dependencies &&
                Object.keys(pkg.dependencies).includes(
                    '@dhis2/cli-app-scripts'
                )))
    ) {
        reporter.warn(
            'A version of `@dhis2/cli-app-scripts` is already listed as a dependency, use --force to overwrite it'
        )
    } else {
        reporter.info('Installing @dhis2/cli-app-scripts...')
        await exec({
            cmd: 'yarn',
            args: ['add', '--dev', '@dhis2/cli-app-scripts'],
            cwd: paths.base,
        })
    }

    if (
        !force &&
        ((pkg.dependencies &&
            Object.keys(pkg.dependencies).includes('@dhis2/app-runtime')) ||
            (pkg.peerDependencies &&
                Object.keys(pkg.peerDependencies).includes(
                    '@dhis2/app-runtime'
                )))
    ) {
        reporter.warn(
            'A version of `@dhis2/app-runtime` is already listed as a dependency, use --force to overwrite it'
        )
    } else {
        reporter.info('Installing @dhis2/app-runtime...')
        await exec({
            cmd: 'yarn',
            args: ['add', '@dhis2/app-runtime'],
            cwd: paths.base,
        })
    }

    const entrypoint = lib ? 'src/index.js' : 'src/App.js'

    if (fs.existsSync(path.join(paths.base, entrypoint))) {
        reporter.warn(
            `An entrypoint file at ${entrypoint} already exists, remove it to create the sample entrypoint`
        )
    } else {
        reporter.info(`Creating entrypoint ${chalk.bold(entrypoint)}`)
        fs.mkdirpSync(path.join(paths.base, 'src'))
        fs.copyFileSync(
            path.join(__dirname, '../../config/init.entrypoint.js'),
            path.join(paths.base, entrypoint)
        )

        if (!lib) {
            fs.copyFileSync(
                path.join(__dirname, '../../config/init.App.test.js'),
                path.join(paths.base, 'src/App.test.js')
            )
        }
    }

    reporter.print('')
    reporter.info('SUCCESS!')
    const cdCmd = name != '.' ? `cd ${name} && ` : ''
    reporter.print(
        `Run ${chalk.bold(
            `${cdCmd}yarn start`
        )} to launch your new DHIS2 application`
    )
}

const command = {
    command: 'init <name>',
    desc: 'Setup an app ',
    builder: {
        force: {
            description: 'Overwrite existing files and configurations',
            type: 'boolean',
            default: false,
        },
        lib: {
            description: 'Create a library',
            type: 'boolean',
            default: false,
        },
    },
    handler,
}

module.exports = command
