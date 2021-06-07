const { handleMutation } = require('../handleMutation')
const { handleQuery } = require('../handleQuery')
const { extractQueryDefinition } = require('./extractQueryDefinition')
const { validateHasSingleExpression } = require('./validateHasSingleExpression')
const {
    validateIsGqlTemplateExpression,
} = require('./validateIsGqlTemplateExpression')

module.exports.plugin = ({ types }) => ({
    visitor: {
        TaggedTemplateExpression(path) {
            try {
                const { node } = path
                if (!validateIsGqlTemplateExpression(node)) return

                const { quasi } = node
                const { quasis } = quasi
                validateHasSingleExpression(quasis)

                const definition = extractQueryDefinition(quasis)
                const { operation } = definition

                if (operation === 'query') {
                    handleQuery(types, path, definition)
                } else {
                    handleMutation(types, path, definition)
                }
            } catch (e) {
                // TODO: Make sure this gets removed from the production build
                if (process.env.NODE_ENV === 'test') {
                    console.log(
                        [
                            e.message,
                            ...e.stack
                                .split('\n')
                                .map(line => {
                                    const match = line.match(
                                        /gql-to-app-runtime-query\/src.*:\d+:\d/
                                    )

                                    return match && match.length
                                        ? match[0]
                                        : match
                                })
                                .filter(i => i)
                                .map(line => `  at ${line}`),
                        ].join('\n')
                    )
                } else {
                    throw e
                }
            }
        },
    },
})
