module.exports.validateIsGqlTemplateExpression = node => {
    const { tag } = node
    return tag.name === 'gql'
}
