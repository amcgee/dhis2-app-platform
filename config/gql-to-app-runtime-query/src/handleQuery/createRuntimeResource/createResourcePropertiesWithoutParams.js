const { createValuesFromField } = require('./createValuesFromField')
const {
    possibleDynamicObjectArgToValue,
} = require('./possibleDynamicObjectArgToValue')

const idArgToValue = (types, idArg) => {
    if (!idArg) return

    if (idArg.value.kind === 'Variable') {
        return types.arrowFunctionExpression(
            [
                types.objectPattern([
                    types.objectProperty(
                        types.identifier('id'),
                        types.identifier('id'),
                        false,
                        true
                    ),
                ]),
            ],
            types.identifier('id')
        )
    } else if (idArg.value.kind === 'StringValue') {
        return types.objectExpression([
            types.objectProperty(
                types.identifier('id'),
                types.stringLiteral(idArg.value.value)
            ),
        ])
    }

    throw new Error(
        `The value of "id" property of "${name}" can be of type "Variable" or "StringValue", but received "${idArg.value.kind}"`
    )
}

const createResourcePropertiesWithoutParams = ({ types, args, variables }) => {
    return args.reduce((resourceProperties, arg) => {
        // Params needs to be handled separately as the fields will impact
        // the final params as well. Added after the creation of the
        // resource properties
        if (arg.name.value === 'params') return resourceProperties

        if (arg.name.value === 'id') {
            return {
                ...resourceProperties,
                id: idArgToValue(types, arg),
            }
        }

        if (arg.name.value === 'data') {
            return {
                ...resourceProperties,
                data: possibleDynamicObjectArgToValue({
                    types,
                    arg,
                    variables,
                }),
            }
        }

        return {
            ...resourceProperties,
            [arg.name.value]: createValuesFromField(types, arg),
        }
    }, {})
}

module.exports.createResourcePropertiesWithoutParams = createResourcePropertiesWithoutParams
