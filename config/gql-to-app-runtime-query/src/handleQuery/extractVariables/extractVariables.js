const { getDefaultValueOfVariable } = require('./getDefaultValueOfVariable')
const { getGraphqlType } = require('./getGraphqlType')
const { getTypeOfVariable } = require('./getTypeOfVariable')
const {
    validateVariableDefaultValues,
} = require('./validateVariableDefaultValues')

module.exports.extractVariables = definition => {
    const { variableDefinitions } = definition

    const variables = variableDefinitions.map(variableDefinition => ({
        name: variableDefinition.variable.name.value,
        type: getTypeOfVariable(variableDefinition),
        graphqlType: getGraphqlType(variableDefinition),
        defaultValue: getDefaultValueOfVariable(variableDefinition),
        required: variableDefinition.type.kind === 'NonNullType',
    }))

    validateVariableDefaultValues(variables)

    return variables
}
