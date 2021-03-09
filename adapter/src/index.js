import { HeaderBar, CssReset } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Suspense } from 'react'
import { Alerts } from './components/Alerts'
import { AuthBoundary } from './components/AuthBoundary'
import { FatalErrorBoundary } from './components/FatalErrorBoundary'
import { LoadingMask } from './components/LoadingMask'
import { ServerVersionProvider } from './components/ServerVersionProvider'
import { styles } from './styles.js'

const App = ({ url, apiVersion, appName, children }) => (
    <>
        <CssReset />
        <FatalErrorBoundary>
            <ServerVersionProvider url={url} apiVersion={apiVersion}>
                <div className="app-shell-adapter">
                    <style jsx>{styles}</style>
                    <HeaderBar appName={appName} />
                    <AuthBoundary url={url}>
                        <div className="app-shell-app">
                            <Suspense fallback={<LoadingMask />}>
                                {children}
                            </Suspense>
                        </div>
                    </AuthBoundary>
                    <Alerts />
                </div>
            </ServerVersionProvider>
        </FatalErrorBoundary>
    </>
)

App.propTypes = {
    appName: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    apiVersion: PropTypes.number,
    children: PropTypes.element,
}

export default App
