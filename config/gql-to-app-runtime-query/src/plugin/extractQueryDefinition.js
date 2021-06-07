const gql = require('graphql-tag')

module.exports.extractQueryDefinition = quasis => {
    const [templateElement] = quasis
    const query = templateElement.value.raw

    const parsedQuery = gql(query)
    const { definitions } = parsedQuery

    if (definitions.length > 1) {
        throw new Error(
            `Only 1 operation type is allowed per query, got "${definitions.length}"`
        )
    }

    const [definition] = definitions

    return definition
}
