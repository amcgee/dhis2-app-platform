const getNestedLevelFields = curFields =>
    curFields.filter(field => field instanceof Object)

module.exports.getNestedLevelFields = getNestedLevelFields
