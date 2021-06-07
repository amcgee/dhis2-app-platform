const {
    createResourcePropertiesWithoutParams,
} = require('./createResourcePropertiesWithoutParams')
const {
    possibleDynamicObjectArgToValue,
} = require('./possibleDynamicObjectArgToValue')

module.exports.createRuntimeResource = ({ variables, resource, types }) => {
    const { name, args, fields } = resource

    const runtimeResourceProperties = createResourcePropertiesWithoutParams({
        types,
        args,
        variables,
    })
    runtimeResourceProperties.params = possibleDynamicObjectArgToValue({
        arg: args.find(arg => arg.name.value === 'params'),
        types,
        fields,
        variables,
    })

    return types.objectProperty(
        types.identifier(name),
        types.objectExpression(
            Object.entries(runtimeResourceProperties).map(([key, value]) => {
                return types.objectProperty(types.identifier(key), value)
            })
        )
    )
}
