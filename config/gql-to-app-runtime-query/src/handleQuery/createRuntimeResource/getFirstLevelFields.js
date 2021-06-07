const { pipe } = require('./pipe')

const transformSpecialFields = field => {
    if (field === '__all') return '*'
    return field
}

const getFirstLevelFields = pipe(
    curFields => curFields.filter(field => !(field instanceof Object)),
    curFields => curFields.map(transformSpecialFields)
)

module.exports.getFirstLevelFields = getFirstLevelFields
