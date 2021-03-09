const baseConfig = require('./d2.config.base.js')

const config = {
    ...baseConfig,
    type: 'app',
    shell: '@dhis2/app-shell', // TODO: implement

    entryPoints: {
        app: './src/App.js',
        bootstrap: require.resolve('./bootstrap.js'),
    },

    buildOptions: {
        ...baseConfig.buildOptions,
        modules: {
            react: mode => ({
                entry: `react/cjs/react.${
                    mode === 'production' ? 'production.min' : 'development'
                }.js`,
                format: 'umd',
                exports: 'named',
            }),
            'react-dom': mode => ({
                entry: `react-dom/cjs/react-dom.${
                    mode === 'production' ? 'production.min' : 'development'
                }.js`,
                format: 'umd',
                exports: 'named',
            }),
            '@dhis2/app-adapter': '@dhis2/app-adapter',
            '@dhis2/app-runtime': '@dhis2/app-runtime',
            '@dhis2/d2-i18n': '@dhis2/d2-i18n',
            moment: 'moment',
            '@dhis2/ui': '@dhis2/ui',
            'styled-jsx/style': 'styled-jsx/dist/style.js',
            d2: {
                entry: 'd2/src/d2.js', // Use ES modules source instead of CJS build
                format: 'umd',
            },
        },
    },
}

module.exports = config
