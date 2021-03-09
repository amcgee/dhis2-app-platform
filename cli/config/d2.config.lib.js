const baseConfig = require('./d2.config.base.js')

const config = {
    ...baseConfig,
    type: 'lib',

    entryPoints: {
        lib: './src/index.js',
    },
}

module.exports = config
