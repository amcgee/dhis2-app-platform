const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')

module.exports = (cwd = process.cwd()) => {
    const base = path.resolve(cwd)
    const paths = {
        configDefaultsApp: path.join(
            __dirname,
            '../../config/d2.config.app.js'
        ),
        configDefaultsLib: path.join(
            __dirname,
            '../../config/d2.config.lib.js'
        ),
        readmeDefault: path.join(__dirname, '../../config/init.README.md'),

        shellSource: path.dirname(
            require.resolve('../../config/shell/index.html')
        ),

        base,
        package: path.join(base, './package.json'),
        dotenv: path.join(base, './.env'),
        config: path.join(base, './d2.config.js'),
        readme: path.join(base, './README.md'),
        src: path.join(base, './src'),
        public: path.join(base, './public'),
        jestConfig: path.join(base, 'jest.config.js'),
        i18nStrings: path.join(base, './i18n'),
        i18nLocales: path.join(base, './src/locales'),

        buildOutput: path.join(base, './build'),
        buildAppOutput: path.join(base, './build/app'),
        buildAppManifest: path.join(base, './build/app/manifest.webapp'),
        buildAppConfigJson: path.join(base, './build/app/d2.config.json'),
        buildAppBundle: path.join(
            base,
            './build/bundle/dhis2-{{name}}-{{version}}.zip'
        ),
    }

    reporter.debug('PATHS', paths)

    return paths
}
