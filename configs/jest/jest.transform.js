const configFactory = require('@dhis2/config-babel/configFactory')
module.exports = require('babel-jest').createTransformer(
    configFactory({ mode: 'test', moduleType: 'commonjs' })
)
