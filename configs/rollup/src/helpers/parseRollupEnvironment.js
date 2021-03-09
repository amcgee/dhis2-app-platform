export const parseRollupEnvironment = environment => {
    if (Array.isArray(environment)) {
        return environment
            .map(parseRollupEnvironment)
            .reduce((out, env) => ({ ...out, ...env }), {})
    }

    let env = {}

    env.MODE = env.MODE || process.env.NODE_ENV || 'development'
    env.PUBLIC_URL = env.PUBLIC_URL || process.env.PUBLIC_URL || '.'
    for (const key of Object.keys(process.env).filter(key =>
        key.startsWith('DHIS2_')
    )) {
        env[key] = process.env[key]
        env['REACT_APP_' + key] = process.env[key]
    }

    if (typeof environment === 'string') {
        env = {}
        const envVars = environment.split(',')
        envVars.forEach(envVar => {
            const [key, value] = envVar.split(':')
            if (typeof value === 'undefined') {
                env[key] = true
            } else {
                env[key] = value
            }
        })
    } else if (typeof environment === 'object') {
        env = {
            ...env,
            ...environment,
        }
    }

    process.env.NODE_ENV = env.MODE

    return env
}
