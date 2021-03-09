const browserTargets = require('@dhis2/browserslist-config')
const jestTargets = { node: 'current' }

const getBabelModuleType = moduleType => {
    switch (moduleType) {
        case 'cjs':
        case 'commonjs':
            return 'commonjs'
        case 'amd':
        case 'umd':
        case 'system':
            return moduleType
        case 'es':
        default:
            return false
    }
}

module.exports = ({ mode, moduleType = 'es' }) => {
    mode =
        mode || process.env.BABEL_ENV || process.env.NODE_ENV || 'development'
    const isTest = mode === 'test'

    return {
        sourceMaps: 'inline',
        presets: [
            require('@babel/preset-react'),
            require('@babel/preset-typescript'),
            [
                require('@babel/preset-env'),
                {
                    modules: getBabelModuleType(moduleType),
                    targets: isTest ? jestTargets : browserTargets,
                },
            ],
        ],
        plugins: [
            // Adds syntax support for import()
            require('@babel/plugin-syntax-dynamic-import').default,

            /*
             * These plugins actually transform code
             */

            // Automatically include a React import when JSX is present
            require('babel-plugin-react-require'),

            // Adds support for arrow-function class properties
            // class { handleClick = () => { } }
            require('@babel/plugin-proposal-class-properties'),

            // Adds syntax support for optional chaining (?.)
            require('@babel/plugin-proposal-optional-chaining'),

            // Adds support for default value using ?? operator
            require('@babel/plugin-proposal-nullish-coalescing-operator'),
        ],
        env: {
            production: {
                plugins: [
                    [require('styled-jsx/babel'), { optimizeForSpeed: true }],
                ],
            },
            development: {
                plugins: [
                    [require('styled-jsx/babel'), { optimizeForSpeed: true }],
                ],
            },
            test: {
                plugins: [require('styled-jsx/babel-test')],
            },
        },
    }
}
