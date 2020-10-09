import React from 'react'
import PropTypes from 'prop-types'
import { HeaderBar } from '@dhis2/ui'
import { FatalErrorBoundary } from './components/FatalErrorBoundary'
import { AuthBoundary } from './components/AuthBoundary'

import { styles } from './styles.js'
import { ServerVersionProvider } from './components/ServerVersionProvider'

const App = ({ url, apiVersion, appName, children }) => (
    <FatalErrorBoundary>
        <ServerVersionProvider url={url} apiVersion={apiVersion}>
            <div className="app-shell-adapter">
                <style jsx>{styles}</style>
                <HeaderBar appName={appName} />
                <AuthBoundary url={url}>
                    <div className="app-shell-app">{children}</div>
                </AuthBoundary>
            </div>
        </ServerVersionProvider>
    </FatalErrorBoundary>
)

App.propTypes = {
    appName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
}

export default App
