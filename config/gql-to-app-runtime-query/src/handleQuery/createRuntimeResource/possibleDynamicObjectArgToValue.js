const {
    createASTValue,
    createValuesFromField,
} = require('./createValuesFromField')
const { getFirstLevelFields } = require('./getFirstLevelFields')
const { getNestedLevelFields } = require('./getNestedLevelFields')
const { pipe } = require('./pipe')

const transformNestedFields = fields =>
    fields.map(field => {
        const [[namespace, subFields]] = Object.entries(field)
        const firstLevelFields = getFirstLevelFields(subFields)
        const secondLevelFields = getNestedLevelFields(subFields)

        if (secondLevelFields.length && firstLevelFields.length) {
            return `${namespace}[${firstLevelFields.join(
                ','
            )},${transformNestedFields(secondLevelFields)}]`
        }

        if (secondLevelFields.length) {
            return `${namespace}[${transformNestedFields(secondLevelFields)}]`
        }

        return `${namespace}[${firstLevelFields.join(',')}]`
    })

const createLiteralForGraphqlPrimitive = (types, type, value) => {
    if (['StringLiteral', 'StringValue'].includes(type)) {
        return createASTValue({ types, type, value })
    }

    if (['NumberLiteral', 'IntValue', 'FloatValue'].includes(type)) {
        return createASTValue({
            types,
            type,
            value,
        })
    }

    if (['BooleanValue', 'BooleanLiteral'].includes(type)) {
        let booleanValue = value

        if (typeof value === 'string') {
            booleanValue = value === 'true' ? true : false
        }

        return createASTValue({
            types,
            type,
            value: booleanValue,
        })
    }

    throw new Error(`Can't create literal for type "${type}". Not supported`)
}

const createObjectExpressionWithFields = (types, fields) => {
    return types.objectExpression(
        fields.map(field => {
            let value

            if (field.value.kind === 'ObjectValue') {
                value = createObjectExpressionWithFields(
                    types,
                    field.value.fields
                )
            } else if (field.value.kind === 'ListValue') {
                value = createListExpressionWithValues(
                    types,
                    field.value.values
                )
            } else {
                value = createLiteralForGraphqlPrimitive(
                    types,
                    field.value.kind,
                    field.value.value
                )
            }

            return types.objectProperty(
                types.identifier(field.name.value),
                value
            )
        })
    )
}

const createListExpressionWithValues = (types, items) => {
    return createASTValue({
        types,
        type: 'ListValue',
        values: items,
    })
}

const variablesToFunctionArgument = ({ types, variables }) => {
    const fields = variables.map(variable => {
        const { name, defaultValue, type } = variable

        if (typeof defaultValue === 'undefined') {
            return types.objectProperty(
                types.identifier(name),
                types.identifier(name),
                false,
                true
            )
        }

        if (type === 'ObjectExpression') {
            return types.objectProperty(
                types.identifier(name),
                types.assignmentPattern(
                    types.identifier(name),
                    createObjectExpressionWithFields(types, defaultValue)
                ),
                false,
                true
            )
        }

        if (type === 'ArrayExpression') {
            return types.objectProperty(
                types.identifier(name),
                types.assignmentPattern(
                    types.identifier(name),
                    createListExpressionWithValues(types, defaultValue)
                ),
                false,
                true
            )
        }

        return types.objectProperty(
            types.identifier(name),
            types.assignmentPattern(
                types.identifier(name),
                createLiteralForGraphqlPrimitive(types, type, defaultValue)
            ),
            false,
            true
        )
    })

    return types.objectPattern(fields.filter(i => i))
}

const createFieldsObjectProperty = (types, fields) => {
    const firstLevelFields = getFirstLevelFields(fields)
    const nestedFields = pipe(
        getNestedLevelFields,
        transformNestedFields
    )(fields)

    const allFields = [...firstLevelFields, ...nestedFields]
        .filter(value => value)
        .map(value => types.stringLiteral(value))

    return types.objectProperty(
        types.identifier('fields'),
        types.arrayExpression(allFields)
    )
}

const createFuncBody = (types, paramsFields, fields) => {
    const fieldsObjectProperty = fields
        ? [createFieldsObjectProperty(types, fields)]
        : []

    const paramsFieldsObjectProperties = paramsFields
        ? paramsFields.map(field =>
              types.objectProperty(
                  types.identifier(field.name.value),
                  createValuesFromField(types, field)
              )
          )
        : []

    return [...fieldsObjectProperty, ...paramsFieldsObjectProperties]
}

const possibleDynamicObjectArgToValue = ({ types, arg, fields, variables }) => {
    if (fields || (arg && arg.value.kind === 'ObjectValue')) {
        const paramsFuncBodyProperties = createFuncBody(
            types,
            arg && arg.value && arg.value.fields,
            fields
        )

        const paramsFuncBody = types.objectExpression(paramsFuncBodyProperties)

        const funcArgs = variablesToFunctionArgument({ types, variables })

        return types.arrowFunctionExpression([funcArgs], paramsFuncBody)
    }

    throw new Error(
        `The value of "params" property of "${name}" can be of type "Variable" or "StringValue", but received "${arg.value.kind}"`
    )
}

module.exports.possibleDynamicObjectArgToValue = possibleDynamicObjectArgToValue
