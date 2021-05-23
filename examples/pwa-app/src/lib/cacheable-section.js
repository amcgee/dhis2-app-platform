import { Layer } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useCachedSections } from './cached-sections.js'
import { useOfflineInterface } from './offline-interface.js'

// default is 'null'
const recordingStates = {
    pending: 'pending',
    recording: 'recording',
    error: 'error',
}

export function useCacheableSection(id) {
    const offlineInterface = useOfflineInterface()
    const {
        cachedSections,
        removeSection,
        updateSections,
    } = useCachedSections()
    const [recordingState, setRecordingState] = useState(null)

    function startRecording() {
        // This promise resolving means that the message to the service worker
        // to start recording was successful. Waiting for resolution prevents
        // unnecessarily rerendering the whole component in case of an error
        offlineInterface
            .startRecording({
                sectionId: id,
                recordingTimeoutDelay: 1000,
                onStarted: onRecordingStarted,
                onCompleted: onRecordingCompleted,
                onError: onRecordingError,
            })
            .then(() => setRecordingState(recordingStates.pending))
            .catch(err => {
                // TODO: Alert error
                console.error(err)
            })
    }

    function onRecordingStarted() {
        setRecordingState(recordingStates.recording)
    }

    function onRecordingCompleted() {
        // TODO: Alert success
        setRecordingState(null)
        updateSections()
    }

    function onRecordingError(error) {
        // TODO: Handle error. Alert too?
        console.error('Oops! Something went wrong with the recording.', error)
        setRecordingState(recordingStates.error)
    }

    // Section status: this and 'delete' _could_ be accessed by useCachedSection,
    // but they're provided through this hook for convenience
    const lastUpdated = cachedSections.get(id) // might be undefined
    const isCached = !!lastUpdated
    const remove = () => removeSection(id)

    return {
        recordingState,
        startRecording,
        lastUpdated,
        isCached,
        remove,
    }
}

export function CacheableSection({ recordingState, children }) {
    // This will cause the component to reload in the event of a recording error;
    // the state will be cleared next time recording moves to pending.
    // Fixes a component getting stuck while rendered without data after failing a
    // recording while offline.
    // Errors can be handled in useCacheableSection > onRecordingError
    if (recordingState === recordingStates.error) return children

    // Handling this way prevents the component rerendering unnecessarily after
    // completing a recording:
    return (
        <>
            {recordingState === recordingStates.recording && (
                <Layer translucent />
            )}
            {recordingState !== recordingStates.pending && children}
        </>
    )
}

CacheableSection.propTypes = {
    children: PropTypes.node,
    recordingState: PropTypes.oneOf([
        recordingStates.pending,
        recordingStates.recording,
        recordingStates.error,
        null,
    ]),
}
