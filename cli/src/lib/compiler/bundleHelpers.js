const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

const runtimeModuleNamespace = '$dhis2'
const bootstrapModuleName = '__BOOTSTRAP__'

const applyIndexTemplate = async (
    assets,
    { srcDir, outDir, importMap, title }
) => {
    const templateFile = path.join(srcDir, 'index.html')
    const destinationFile = path.join(outDir, 'index.html')
    const template = await fs.readFile(templateFile)

    const replacements = {
        __IMPORT_MAP__: JSON.stringify(importMap, undefined, 2),
        __MODULE_PATH_BOOTSTRAP__: assets[bootstrapModuleName].path,
        __TITLE__: title,
    }

    let result = String(template)
    Object.keys(replacements).forEach(replacement => {
        result = result.replace(
            new RegExp(replacement, 'g'),
            replacements[replacement]
        )
    })

    await fs.writeFile(destinationFile, result)
}

const generateImportMap = assets => {
    return {
        imports: Object.keys(assets).reduce((imports, name) => {
            if (
                assets[name].type === 'chunk' &&
                assets[name].isEntry &&
                ['system', 'umd'].includes(assets[name].format)
            ) {
                imports[name] = assets[name].path
            }
            return imports
        }, {}),
    }
}

const writeImportMap = async (importMap, importMapFile) => {
    await fs.writeJSON(importMapFile, importMap, { spaces: 2 })
}

function BatchWarnings() {
    const warnings = []
    const flush = () => {
        while (warnings.length) {
            reporter.warn(warnings.shift().toString())
        }
    }
    const add = (moduleName, warning) =>
        warnings.push(
            `[${moduleName}] @ ${warning.id}\n${chalk.dim(warning.toString())}`
        )
    return {
        warnings,
        flush,
        add,
    }
}

module.exports = {
    runtimeModuleNamespace,
    bootstrapModuleName,
    applyIndexTemplate,
    generateImportMap,
    writeImportMap,
    BatchWarnings,
}
