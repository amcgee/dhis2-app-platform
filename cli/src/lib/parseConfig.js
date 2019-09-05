const { reporter } = require('@dhis2/cli-helpers-engine')
const { defaultsDeep, has, isPlainObject } = require('lodash')
const fs = require('fs-extra')
const chalk = require('chalk')
const getAuthorRegex = require('author-regex')

const requiredConfigFields = {
    app: ['name', 'version', 'title', 'entryPoints.app'],
    lib: ['name', 'version', 'entryPoints.lib'],
}

const parseAuthor = author => {
    if (isPlainObject(author)) {
        return {
            name: author.name,
            email: author.email,
            url: author.url,
        }
    }

    const parsedAuthor = getAuthorRegex().exec(author)
    if (!parsedAuthor) return {}
    const out = { name: parsedAuthor[1] }
    if (parsedAuthor[2] && parsedAuthor[2] !== '') out.email = parsedAuthor[2]
    if (parsedAuthor[3] && parsedAuthor[3] !== '') out.url = parsedAuthor[3]
    return out
}

const validateConfig = config => {
    if (!requiredConfigFields[config.type]) {
        reporter.error(
            `Unknown type ${chalk.bold(config.type)} specified in d2.config.js.`
        )
        reporter.error(`\tValid types:`, Object.keys(requiredConfigFields))
        process.exit(1)
    }
    requiredConfigFields[config.type].forEach(field => {
        if (!has(config, field)) {
            reporter.error(
                `Required config field ${chalk.bold(
                    field
                )} not found in d2.config.js or package.json`
            )
            process.exit(1)
        }
    })
    return true
}

const parseConfig = paths => {
    try {
        let config = {}
        // if (!fs.existsSync(paths.config)) {
        //     reporter.error('Config file d2.config.js not found - use the init command to create one!')
        //     process.exit(1)
        // }

        if (fs.existsSync(paths.config)) {
            reporter.debug('Loading d2 config at', paths.config)
            config = require(paths.config)
            reporter.debug('loaded', config)
        }

        const type = config.type || 'app'
        reporter.debug(`Type identified : ${chalk.bold(type)}`)

        const defaults =
            type === 'lib' ? paths.configDefaultsLib : paths.configDefaultsApp
        config = defaultsDeep(config, require(defaults))

        if (fs.existsSync(paths.package)) {
            const pkg = require(paths.package)
            config.name = config.name || pkg.name
            config.version = config.version || pkg.version
            config.author = config.author || parseAuthor(pkg.author)
        }
        config.title = config.title || config.name

        validateConfig(config)

        reporter.debug('config loaded', config)
        return config
    } catch (e) {
        reporter.error('Failed to load d2 config!')
        reporter.debugErr(e)
        process.exit(1)
    }
}

module.exports = parseConfig
