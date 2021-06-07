module.exports.getDefaultValueOfVariable = variableDefinition => {
    if (!variableDefinition.defaultValue) {
        return undefined
    }

    if ('ObjectValue' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.fields
    }

    if ('ListValue' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.values
    }

    return variableDefinition.defaultValue.value
}
