/*
 * @deprecated use the package @dhis2/config-babel instead!
 */
const makeBabelConfig = ({ moduleType, mode }) => api => {
    console.warn(
        "@dhis2/cli-app-scripts/config/makeBabelConfig is deprecated and will soon be removed, plase don't use it!"
    )

    return require('@dhis2/config-babel/configFactory')(api, {
        mode,
        moduleType,
    })
}

module.exports = makeBabelConfig
