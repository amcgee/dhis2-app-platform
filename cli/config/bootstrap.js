/* global System */
import 'systemjs/dist/s.js'
import 'systemjs/dist/extras/amd.js'

const appConfig = {
    url:
        process.env.REACT_APP_DHIS2_BASE_URL ||
        window.localStorage.DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
}

const render = async () => {
    const React = await System.import('react')
    const ReactDOM = await System.import('react-dom')
    const Adapter = await System.import('@dhis2/app-adapter')

    const LazyApp = React.lazy(() => System.import('$dhis2/dashboard/app'))

    ReactDOM.render(
        React.createElement(
            Adapter.default,
            { ...appConfig },
            React.createElement(LazyApp)
        ),
        document.getElementById('root')
    )
}

render()

// tryWithImportMapFallbacks(render, [
//     // Instance-provided shell import map
//     `${appConfig.url}/api/apps/app-shell/systemjs-importmap.production.js`,
//     // Local fallback
//     __IMPORT_MAP__
// ], true)
