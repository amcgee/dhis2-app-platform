import { checkForSWUpdateAndReload, OfflineInterface } from '@dhis2/pwa/browser'
import PropTypes from 'prop-types'
import React from 'react'
import { AppWrapper } from './components/AppWrapper.js'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ServerVersionProvider } from './components/ServerVersionProvider'

const offlineInterface = new OfflineInterface()

const AppAdapter = ({ url, apiVersion, appName, children }) => (
    <ErrorBoundary fullscreen onRetry={checkForSWUpdateAndReload}>
        <ServerVersionProvider
            url={url}
            apiVersion={apiVersion}
            offlineInterface={offlineInterface}
        >
            <AppWrapper appName={appName}>{children}</AppWrapper>
        </ServerVersionProvider>
    </ErrorBoundary>
)

AppAdapter.propTypes = {
    appName: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
    url: PropTypes.string,
}

export default AppAdapter
