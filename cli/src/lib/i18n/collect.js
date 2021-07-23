const path = require('path')
const fs = require('fs-extra')

const localeFileSuffix = '.locale.js'
const requiredDefaultLocale = 'en' // TODO: support entirely non-english libraries?
const packageExportsNamespace = 'd2-i18n' // Suitably non-generic?

const makeImport = (depName, locale) => {
    // platform-built libraries should bundle their transitive deps at build/i18n
    // exports: { "./d2-i18n/*": "./build/i18n/*" }
    // Should be declared in `package.json`
    return `${depName}/${packageExportsNamespace}/${locale}${localeFileSuffix}`
}

const collectLocalesFromDependency = (depName, defaultLocalePath) => {
    const baseDir = path.dirname(defaultLocalePath)
    const files = fs.readdirSync(baseDir)

    return files
        .filter(file => file.endsWith(localeFileSuffix))
        .reduce((locales, file) => {
            const locale = file.replace(
                new RegExp(`/${localeFileSuffix}$/`),
                ''
            )
            locales[locale] = makeImport(depName, locale)
            return locales
        }, {})
}

export const collect = ({ paths }) => {
    const pkg = require(paths.package)

    const dependencies = pkg.dependencies

    const importsByLocale = {}

    Object.keys(dependencies).forEach(dep => {
        try {
            const localeSourcePath = require.resolve(
                makeImport(dep, requiredDefaultLocale)
            )
            if (localeSourcePath) {
                const locales = collectLocalesFromDependency(
                    dep,
                    localeSourcePath
                )
                Object.keys(locales).forEach(locale => {
                    importsByLocale[locale] = [
                        ...importsByLocale[locale],
                        locales[locale],
                    ]
                })
            }
            // TODO: deep find all deps in the tree?  (search transitive deps)
        } catch (err) {
            // ignore
        }
    })

    /*
     * Sample output:
     *   {
     *     "en": ["dep1/d2-i18n/en.json", "dep2/d2-i18n/en.json", "dep3/d2-i18n/en.json"]
     *     "fr"" ["dep1/d2-i18n/fr.json", "dep3/d2-i18n/fr.json"]
     *     "nb": ["dep2/d2-i18n/nb.json", "dep3/d2-i18n/nb.json"]
     *   }
     */
    return importsByLocale
}
