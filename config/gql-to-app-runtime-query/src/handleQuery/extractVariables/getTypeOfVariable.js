const { getGraphqlType } = require('./getGraphqlType')

module.exports.getTypeOfVariable = variableDefinition => {
    const graphqlType = getGraphqlType(variableDefinition)
    const is = v => v === graphqlType

    if (is('String') || is('ID')) return 'StringLiteral'
    if (is('Int') || is('Float')) return 'NumberLiteral'
    if (is('Boolean')) return 'BooleanLiteral'
    if (is('Object')) return 'ObjectExpression'
    if (is('Array')) return 'ArrayExpression'

    throw new Error(`Type "${graphqlType}" not supported`)
}
