import { swMsgs } from '../lib/constants'
import { SECTIONS_STORE } from '../lib/sections-db'

// Triggered on 'START_RECORDING' message
export function startRecording(event) {
    console.debug('[SW] Starting recording')
    if (!event.data.payload?.sectionId) {
        throw new Error('[SW] No section ID specified to record')
    }

    const clientId = event.source.id // clientId from MessageEvent
    // Throw error if another recording is in process
    if (isClientRecording(clientId)) {
        throw new Error(
            "[SW] Can't start a new recording; a recording is already in process"
        )
    }

    const newClientRecordingState = {
        sectionId: event.data.payload?.sectionId,
        pendingRequests: new Set(),
        // `fulfilledRequests` can later hold useful data for normalization.
        // Until then, it's just a count
        fulfilledRequests: 0,
        recordingTimeout: undefined,
        recordingTimeoutDelay:
            event.data.payload?.recordingTimeoutDelay || 1000,
        confirmationTimeout: undefined,
    }
    self.clientRecordingStates[clientId] = newClientRecordingState

    // Send confirmation message to client
    self.clients.get(clientId).then(client => {
        client.postMessage({ type: swMsgs.recordingStarted })
    })
}

/** Used to check if a new recording can begin */
function isClientRecording(clientId) {
    return clientId in self.clientRecordingStates
}

/** Used to check if requests should be handled by recording handler */
export function isClientRecordingRequests(clientId) {
    // Don't record requests when waiting for completion confirmation
    return (
        isClientRecording(clientId) &&
        self.clientRecordingStates[clientId].confirmationTimeout === undefined
    )
}

/** Request handler during recording mode */
export function handleRecordedRequest({ request, event }) {
    const recordingState = self.clientRecordingStates[event.clientId]

    clearTimeout(recordingState.recordingTimeout)
    recordingState.pendingRequests.add(request)

    fetch(request)
        .then(response => {
            return handleRecordedResponse(request, response, event.clientId)
        })
        .catch(error => {
            console.error(error)
            stopRecording(error, event.clientId)
        })
}

/** Response handler during recording mode */
function handleRecordedResponse(request, response, clientId) {
    const recordingState = self.clientRecordingStates[clientId]
    // add response to temp cache - when recording is successful, move to permanent cache
    const tempCacheKey = getCacheKey('temp', clientId)
    addToCache(tempCacheKey, request, response)

    // normalizing data could happen here; until then, increment counter
    recordingState.fulfilledRequests += 1

    // remove request from pending requests
    recordingState.pendingRequests.delete(request)

    // start timer if pending requests are all complete
    if (recordingState.pendingRequests.size === 0) {
        startRecordingTimeout(clientId)
    }
    return response
}

/**
 * Starts a timer that stops recording when finished. The timer will
 * be cleared if a new request is handled and start again when there are
 * no more pending requests.
 */
function startRecordingTimeout(clientId) {
    const recordingState = self.clientRecordingStates[clientId]
    recordingState.recordingTimeout = setTimeout(
        () => stopRecording(null, clientId),
        recordingState.recordingTimeoutDelay
    )
}

/** Called on recording success or failure */
function stopRecording(error, clientId) {
    const recordingState = self.clientRecordingStates[clientId]

    console.debug('[SW] Stopping recording', { clientId, recordingState })
    clearTimeout(recordingState?.recordingTimeout)

    // In case of error, notify client and remove recording
    if (error) {
        self.clients.get(clientId).then(client => {
            client.postMessage({
                type: swMsgs.recordingError,
                payload: {
                    error,
                },
            })
        })
        removeRecording(clientId)
        return
    }

    // On success, prompt client to confirm saving recording
    requestCompletionConfirmation(clientId)
}

function getCacheKey(...args) {
    return args.join('-')
}

function addToCache(cacheKey, request, response) {
    if (response.ok) {
        const responseClone = response.clone()
        caches.open(cacheKey).then(cache => cache.put(request, responseClone))
    }
}

function removeRecording(clientId) {
    // Remove recording state
    delete self.clientRecordingStates[clientId]
    // Delete temp cache
    const cacheKey = getCacheKey('temp', clientId)
    return caches.delete(cacheKey)
}

/**
 * To validate a completed recording, request an acknowledgement from
 * the client before finishing and saving the recording. This prevents
 * saving faulty recordings due to navigation or other problems and
 * avoids overwriting a good recording
 */
async function requestCompletionConfirmation(clientId) {
    const client = await self.clients.get(clientId)
    if (!client) {
        console.debug('[SW] Client not found for ID', clientId)
        removeRecording(clientId)
        return
    }
    client.postMessage({ type: swMsgs.confirmRecordingCompletion })
    startConfirmationTimeout(clientId)
}

/**
 * Wait 10 seconds for client acknowledgement to save recording. If timer
 * runs out, the recording is scrapped.
 */
function startConfirmationTimeout(clientId) {
    const recordingState = self.clientRecordingStates[clientId]
    recordingState.confirmationTimeout = setTimeout(() => {
        console.warn(
            '[SW] Completion confirmation timed out. Clearing recording for client',
            clientId
        )
        removeRecording(clientId)
    }, 10000)
}

/** Triggered by 'COMPLETE_RECORDING' message; saves recording */
export async function completeRecording(clientId) {
    const recordingState = self.clientRecordingStates[clientId]
    console.debug('[SW] Completing recording', { clientId, recordingState })
    clearTimeout(recordingState.confirmationTimeout)

    // Move requests from temp cache to section-<ID> cache
    const sectionCache = await caches.open(recordingState.sectionId)
    const tempCache = await caches.open(getCacheKey('temp', clientId))
    const tempCacheItemKeys = await tempCache.keys()
    tempCacheItemKeys.forEach(async request => {
        const response = await tempCache.match(request)
        sectionCache.put(request, response)
    })

    // Add content to DB
    const db = await self.dbPromise
    db.put(SECTIONS_STORE, {
        // Note that request objects can't be stored in the IDB
        // https://stackoverflow.com/questions/32880073/whats-the-best-option-for-structured-cloning-of-a-fetch-api-request-object
        sectionId: recordingState.sectionId, // the key path
        lastUpdated: new Date(),
        // 'requests' can later hold data for normalization
        requests: recordingState.fulfilledRequests,
    }).catch(console.error)

    // Clean up
    removeRecording(clientId)

    // Send confirmation message to client
    self.clients.get(clientId).then(client => {
        client.postMessage({ type: swMsgs.recordingCompleted })
    })
}
