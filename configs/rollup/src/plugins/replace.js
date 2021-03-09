import replace from '@rollup/plugin-replace'
export default ({ env }) => {
    const replacements = Object.keys(env).reduce((replacements, key) => {
        replacements[`process.env.${key}`] = JSON.stringify(env[key])
        return replacements
    }, {})
    replacements['process.env'] = `(${JSON.stringify(env)})` // supports process.env['MODE'] and other edge-cases
    return replace({
        preventAssignment: true,
        values: replacements,
    })
}
