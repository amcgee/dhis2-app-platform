const getFieldsOfSelectionSet = resourceSet => {
    const { selectionSet, name } = resourceSet
    const { selections } = selectionSet

    return {
        [name.value]: selections.map(selection => {
            if (!selection.selectionSet) {
                const field = selection.name.value
                return field === '__all' ? '*' : field
            }

            return getFieldsOfSelectionSet(selection)
        }),
    }
}

module.exports.extractResources = definition => {
    const resourceSets = definition.selectionSet.selections

    return resourceSets.map(resourceSet => {
        const name = resourceSet.name.value
        const args = resourceSet.arguments
        const fields = getFieldsOfSelectionSet(resourceSet)[name]

        return { name, args, fields }
    })
}
