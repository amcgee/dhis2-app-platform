module.exports.getGraphqlType = variableDefinition =>
    variableDefinition.type.kind === 'NonNullType'
        ? variableDefinition.type.type.name.value
        : variableDefinition.type.name.value
