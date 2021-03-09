const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const {
    bootstrapModuleName,
    runtimeModuleNamespace,
} = require('./bundleHelpers')

const parseModuleConfig = (name, moduleConfig, mode) => {
    const defaultConfig = {
        entry: name,
        format: 'system',
    }
    switch (typeof moduleConfig) {
        case 'function':
            return parseModuleConfig(name, moduleConfig(mode), mode)
        case 'object':
            return {
                ...defaultConfig,
                ...moduleConfig,
            }
        case 'string':
            return {
                ...defaultConfig,
                entry: moduleConfig,
            }
        default:
            reporter.error(
                `Invalid module ${name} specified (${moduleConfig}).`
            )
            process.exit(1)
    }
}

module.exports.generateRollupOptions = ({
    d2config: { name, entryPoints, buildOptions },
    outDir,
    env,
}) => {
    const { modules } = buildOptions
    const globals = {}
    const configs = Object.entries(modules).reduce(
        (inputs, [name, rawConfig]) => {
            const moduleConfig = parseModuleConfig(name, rawConfig, env.MODE)
            const { entry, format, ...moduleConfigExtras } = moduleConfig
            try {
                require.resolve(entry, { paths: [process.cwd()] })
            } catch (e) {
                reporter.warn(
                    chalk.dim(
                        `Module ${name} (${entry}) not found, skipping...`
                    )
                )
                return inputs
            }
            if (format === 'umd') {
                globals[name] = name
            }

            inputs.push({
                input: {
                    [name]: entry,
                },
                format,
                extras: moduleConfigExtras,
            })
            return inputs
        },
        []
    )
    const external = configs.reduce((list, config) => {
        Object.keys(config.input).forEach(inputName => {
            if (name !== inputName) {
                list.push(inputName)
            }
        })
        return list
    }, [])
    configs.push({
        input: Object.entries(entryPoints).reduce(
            (localInputs, [entryName, src]) => {
                if (!['bootstrap', 'lib'].includes(entryName)) {
                    localInputs[
                        `${runtimeModuleNamespace}/${name}/${entryName}`
                    ] = src
                }
                return localInputs
            },
            {}
        ),
        format: 'system',
    })
    configs.push({
        input: { [bootstrapModuleName]: entryPoints.bootstrap },
        format: 'iife',
    })
    return configs.map(config => ({
        input: config.input,
        dir: path.join(outDir, 'static/js'),
        format: config.format,
        environment: env,
        globals,
        external: config.format !== 'iife' ? external : undefined,
        ...config.extras,
    }))
}
