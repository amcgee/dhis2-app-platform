const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')

const shellAppDirname = 'src/current-d2-app'

module.exports = makePaths = (cwd = process.cwd()) => {
    const base = path.resolve(cwd)
    const paths = {
        babelConfig: path.join(__dirname, '../../config/babel.config.js'),
        configDefaultsApp: path.join(
            __dirname,
            '../../config/d2.config.app.js'
        ),
        configDefaultsLib: path.join(
            __dirname,
            '../../config/d2.config.lib.js'
        ),
        jestConfigDefaults: path.join(__dirname, '../../config/jest.config.js'),

        shellSource: path.join(__dirname, '../../assets/shell'),

        base,
        package: path.join(base, './package.json'),
        dotenv: path.join(base, './.env'),
        config: path.join(base, './d2.config.js'),
        src: path.join(base, './src'),
        appEntry: path.join(base, './src/App.js'),
        jestConfig: path.join(base, 'jest.config.js'),
        i18nStrings: path.join(base, './i18n'),
        i18nLocales: path.join(base, './src/locales'),

        d2: path.join(base, './.d2/'),
        devOut: path.join(base, './.d2/devOut'),
        appOutputFilename: 'App.js',
        shell: path.join(base, './.d2/shell'),
        shellAppDirname,
        shellApp: path.join(base, `./.d2/shell/${shellAppDirname}`),
        shellBuildOutput: path.join(base, './.d2/shell/build'),

        buildOutput: path.join(base, './build'),
        buildAppOutput: path.join(base, './build/app'),
        buildAppManifest: path.join(base, './build/app/manifest.webapp'),
        buildAppBundle: path.join(
            base,
            './build/bundle/dhis2-{{name}}-{{version}}.zip'
        ),
    }

    reporter.debug('PATHS', paths)

    return paths
}
