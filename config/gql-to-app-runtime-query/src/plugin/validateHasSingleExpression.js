module.exports.validateHasSingleExpression = quasis => {
    if (quasis.length > 1) {
        throw new Error('"${}" Expressions are not allowed inside queries')
    }
}
