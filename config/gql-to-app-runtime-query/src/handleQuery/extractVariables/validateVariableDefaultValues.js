const { validators } = require('./validators')

module.exports.validateVariableDefaultValues = variables => {
    variables.forEach(({ defaultValue, name, graphqlType }) => {
        if (!defaultValue) return

        const validator = validators[graphqlType]

        if (!validator) {
            const availableTypes = Object.keys(validators).join(', ')

            throw new Error(
                `Unsupported variable type "${graphqlType}", available types are: ${availableTypes}`
            )
        }

        validator({ value: defaultValue, name })
    })
}
