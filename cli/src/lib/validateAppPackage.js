const { reporter, chalk, exec } = require('@dhis2/cli-helpers-engine')
const inquirer = require('inquirer')

/*
 * Check for incorrect app dependencies
 */

const singletonDependencies = [
    'react',
    'react-dom',
    '@dhis2/app-runtime',
    '@dhis2/d2-i18n',
    'styled-jsx',
    '@dhis2/ui',
    '@dhis2/ui-core',
]

const validateAppPackage = async (config, paths, { offerFix = true } = {}) => {
    try {
        const yarnVersion = (await exec({
            cmd: 'yarn',
            args: ['--version'],
            cwd: paths.base,
            captureOut: true
        })).trim()
        if (parseInt(yarnVersion.split('.')[0]) < 2) {
            reporter.warn(chalk.dim('Modern yarn (v2) is recommendedx but not currently required.\nVisit https://yarnpkg.com/getting-started/migration for more information'))
        }
        reporter.debug(`Found yarn version ${yarnVersion}`)
    } catch (e) {
        reporter.error('Yarn is required, please visit https://yarnpkg.com', e)
        return false
    }

    let pkg
    try {
        pkg = require(paths.package)
    } catch (e) {
        reporter.error(`Failed to load package manifest at ${paths.package}`)
        return false
    }

    if (pkg.dependencies) {
        const extraneousDeps = singletonDependencies.filter(dep => !!pkg.dependencies[dep])
        if (extraneousDeps.length) {
            reporter.warn(`The following must not be specified as ${chalk.bold('dependencies')}\n${extraneousDeps.map(dep => `\t- ${dep}\n`)}Please move them to ${chalk.bold('peerDependencies')} (and optionally ${chalk.bold('devDependencies')})`)

            if (offerFix) {
                const { fix } = await inquirer.prompt({ name: 'fix', type: 'confirm', message: 'Would you like to move these dependencies?' })

                if (!fix) {
                    return false;
                }

                reporter.print('Moving dependencies to peerDependencies and devDependencies...')
                await exec({
                    cmd: 'yarn',
                    args: ['remove', ...extraneousDeps],
                    cwd: paths.base,
                })

                await exec({
                    cmd: 'yarn',
                    args: ['add', '--peer', ...extraneousDeps.map(dep => `${dep}@${pkg.dependencies[dep]}`)],
                    cwd: paths.base,
                })

                await exec({
                    cmd: 'yarn',
                    args: ['add', '--peer', ...extraneousDeps.map(dep => `${dep}@${pkg.dependencies[dep]}`)],
                    cwd: paths.base,
                })
            } else {
                return false
            }
        }
    }

    return true
}

module.exports = validateAppPackage