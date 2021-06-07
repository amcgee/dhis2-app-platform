const createValuesFromItem = (types, item) => {
    if (item.kind === 'Variable') {
        return createASTValue({
            types,
            type: item.kind,
            value: item.name.value,
        })
    }

    if (
        ['StringValue', 'IntValue', 'FloatValue', 'BooleanValue'].includes(
            item.kind
        )
    ) {
        return createASTValue({
            types,
            type: item.kind,
            value: item.value,
        })
    }

    if (item.kind === 'ObjectValue') {
        return createASTValue({
            types,
            type: item.kind,
            fields: item.fields,
        })
    }

    if (item.kind === 'ListValue') {
        return createASTValue({
            types,
            type: item.kind,
            values: item.values,
        })
    }
}

const createObjectPropertiesFromFields = (types, fields) => {
    return fields.map(field =>
        types.objectProperty(
            types.identifier(field.name.value),
            createValuesFromField(types, field)
        )
    )
}

const createValuesFromField = (types, field) => {
    if (field.value.kind === 'Variable') {
        return types.identifier(field.value.name.value)
    }

    if (field.value.kind === 'StringValue') {
        return types.stringLiteral(field.value.value)
    }

    if (field.value.kind === 'IntValue') {
        return types.numericLiteral(parseInt(field.value.value, 10))
    }

    if (field.value.kind === 'FloatValue') {
        return types.numericLiteral(parseFloat(field.value.value))
    }

    if (field.value.kind === 'BooleanValue') {
        return types.booleanLiteral(field.value.value)
    }

    if (field.value.kind === 'ObjectValue') {
        const objectProperties = createObjectPropertiesFromFields(
            types,
            field.value.fields
        )

        return types.objectExpression(objectProperties)
    }

    if (field.value.kind === 'ListValue') {
        const arrayItems = field.value.values.map(item =>
            createValuesFromItem(types, item)
        )

        return types.arrayExpression(arrayItems)
    }
}

const createASTValue = ({ types, type, value, values, fields }) => {
    if (type === 'Variable') {
        return types.identifier(value)
    }

    if (['StringLiteral', 'StringValue'].includes(type)) {
        return types.stringLiteral(value)
    }

    if (type === 'IntValue') {
        return types.numericLiteral(parseInt(value, 10))
    }

    if (['FloatValue', 'NumberLiteral'].includes(type)) {
        return types.numericLiteral(parseFloat(value))
    }

    if (['BooleanValue', 'BooleanLiteral'].includes(type)) {
        return types.booleanLiteral(value)
    }

    if (type === 'ObjectValue') {
        const objectProperties = createObjectPropertiesFromFields(types, fields)

        return types.objectExpression(objectProperties)
    }

    if (type === 'ListValue') {
        const arrayItems = values.map(curField =>
            createValuesFromItem(types, curField)
        )

        return types.arrayExpression(arrayItems)
    }

    throw new Error(`Can't create literal for type "${type}". Not supported`)
}

module.exports.createASTValue = createASTValue
module.exports.createValuesFromField = createValuesFromField
module.exports.createValuesFromItem = createValuesFromItem
module.exports.createObjectPropertiesFromFields = createObjectPropertiesFromFields
