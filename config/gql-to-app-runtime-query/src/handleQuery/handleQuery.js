const { createRuntimeResource } = require('./createRuntimeResource')
const { extractResources } = require('./extractResources')
const { extractVariables } = require('./extractVariables')

module.exports.handleQuery = (types, path, definition) => {
    const gqlVariables = extractVariables(definition)
    const gqlResourceData = extractResources(definition)

    const runtimeResources = gqlResourceData.map(resource =>
        createRuntimeResource({
            variables: gqlVariables,
            resource,
            types,
        })
    )

    const runtimeQuery = types.objectExpression(runtimeResources)

    path.replaceWith(runtimeQuery)
}
