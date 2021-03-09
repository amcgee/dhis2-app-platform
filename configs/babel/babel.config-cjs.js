const configFactory = require('./configFactory.js')

module.exports = api => {
    return configFactory({ mode: api.env(), moduleType: 'commonjs' })
}
