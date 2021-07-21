import { checkForSWUpdateAndReload, OfflineInterface } from '@dhis2/pwa'
import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { Alerts } from './components/Alerts'
import { AuthBoundary } from './components/AuthBoundary'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ServerVersionProvider } from './components/ServerVersionProvider'
import { styles } from './styles.js'

const offlineInterface = new OfflineInterface()

const App = ({ url, apiVersion, appName, children }) => (
    <ErrorBoundary fullscreen onRetry={checkForSWUpdateAndReload}>
        <ServerVersionProvider
            url={url}
            apiVersion={apiVersion}
            offlineInterface={offlineInterface}
        >
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <HeaderBar appName={appName} />
                <AuthBoundary url={url}>
                    <div className="app-shell-app">
                        <ErrorBoundary onRetry={() => window.location.reload()}>
                            {children}
                        </ErrorBoundary>
                    </div>
                </AuthBoundary>
                <Alerts />
            </div>
        </ServerVersionProvider>
    </ErrorBoundary>
)

App.propTypes = {
    appName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
}

export default App
