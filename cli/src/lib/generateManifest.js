const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

module.exports = (paths, config, publicUrl) => {
    const manifest = {
        app_hub_id: config.id,
        appType: 'APP',
        short_name: config.name,
        name: config.title,
        description: config.description,
        version: config.version,
        core_app: config.coreApp,
        launch_path: 'index.html',
        default_locale: 'en',
        activities: {
            dhis: {
                href: '*',
            },
        },
        icons: {
            48: 'dhis2-app-icon.png',
        },
        developer: config.author,

        manifest_generated_at: String(new Date()),

        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',

        scope: publicUrl,
    }

    reporter.debug('Generated manifest', manifest)

    // For backwards compatibility, WILL BE DEPRECATED
    fs.writeJsonSync(paths.buildAppManifest, manifest, { spaces: 2 })

    // Write config json
    const appConfig = { ...config }
    delete appConfig['entryPoints']
    delete appConfig['buildOptions']

    fs.writeJsonSync(paths.buildAppConfigJson, appConfig, { spaces: 2 })
}
