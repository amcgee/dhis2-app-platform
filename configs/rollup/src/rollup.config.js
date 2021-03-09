import commonjs from '@rollup/plugin-commonjs'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'
import inputSourcemaps from 'rollup-plugin-sourcemaps'
import { configureOutput } from './helpers/configureOutput.js'
import { parseRollupEnvironment } from './helpers/parseRollupEnvironment.js'
import babel from './plugins/babel.js'
import postcss from './plugins/postcss.js'
import replace from './plugins/replace.js'

export const configFactory = commandLineArgs => {
    commandLineArgs.environment = commandLineArgs.environment || {}

    const env = parseRollupEnvironment(commandLineArgs.environment)

    const input = commandLineArgs.input
    const dir = commandLineArgs.dir
    const format = commandLineArgs.format
    const globals = commandLineArgs.globals // umd modules
    const external = commandLineArgs.external // all modules
    const watch = commandLineArgs.watch

    delete commandLineArgs.input
    delete commandLineArgs.format
    delete commandLineArgs.dir
    delete commandLineArgs.globals
    delete commandLineArgs.external
    delete commandLineArgs.watch

    if (!input || !dir) {
        throw new Error('Input and dir must be defined')
    }
    const name =
        typeof input === 'string'
            ? input
            : Array.isArray(input)
            ? input[0]
            : Object.keys(input)[0]

    return {
        input,
        output: configureOutput({ name, dir, mode: env.MODE, globals, format }),
        watch,
        plugins: [
            // Dependency resolution
            nodeResolve({
                mainFields: ['browser', 'module', 'main'],
                exportConditions: [env.MODE],
                preferBuiltins: false,
            }),
            commonjs({
                include: /node_modules/,
            }),
            inputSourcemaps({ include: /node_modules/ }), // TODO: Confirm that this works...

            // Asset loading
            json(),
            postcss({ mode: env.MODE }),
            url({ publicPath: env.PUBLIC_PATH }),

            // Code transformation
            replace({ env }),
            babel({ mode: env.MODE }),
            dynamicImportVars({
                warnOnError: true,
            }),

            // TODO: compile-time eslint
            // TODO: build errors as served html
            // TODO: incremental builds & dev-server HMR
        ],
        external,
    }
}

export default configFactory
