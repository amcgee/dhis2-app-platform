import { clientsClaim } from 'workbox-core'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, setDefaultHandler } from 'workbox-routing'
import {
    NetworkFirst,
    StaleWhileRevalidate,
    Strategy,
} from 'workbox-strategies'
import { openSectionsDB, SECTIONS_STORE } from '../lib/sections-db'

export function setUpServiceWorker() {
    let dbPromise
    const clientRecordingStates = {}
    const CACHE_KEEP_LIST = ['other-assets', 'app-shell']
    // Fallback prevents error when switching from pwa enabled to disabled
    const URL_FILTER_PATTERNS = JSON.parse(
        process.env.REACT_APP_DHIS2_APP_PATTERNS_TO_OMIT || '[]'
    )
    const OMIT_EXTERNAL_REQUESTS =
        process.env.REACT_APP_DHIS2_APP_OMIT_EXTERNAL_REQUESTS === 'true'

    clientsClaim()

    // Table of contents:
    // 1. Workbox routes
    // 2. Service Worker event listeners
    // 3. Helper functions

    // * 1. Worbox routes

    // Precache all of the assets generated by your build process.
    // Their URLs are injected into the manifest variable below.
    // This variable must be present somewhere in your service worker file,
    // even if you decide not to use precaching. See https://cra.link/PWA
    precacheAndRoute(self.__WB_MANIFEST)

    // Similar to above; manifest injection from workbox-build
    // Precaches all assets in the shell's build folder except in `static`
    // (which CRA's workbox-webpack-plugin handle smartly).
    // '[]' fallback prevents an error when switching pwa enabled to disabled
    precacheAndRoute(self.__WB_BUILD_MANIFEST || [])

    // ? QUESTION: Do we need this route?
    // Set up App Shell-style routing, so that all navigation requests
    // are fulfilled with your index.html shell. Learn more at
    // https://developers.google.com/web/fundamentals/architecture/app-shell
    const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$')
    registerRoute(
        // Return false to exempt requests from being fulfilled by index.html.
        ({ request, url }) => {
            // If this isn't a navigation, skip.
            if (request.mode !== 'navigate') {
                return false
            } // If this is a URL that starts with /_, skip.

            if (url.pathname.startsWith('/_')) {
                return false
            } // If this looks like a URL for a resource, because it contains // a file extension, skip.

            if (url.pathname.match(fileExtensionRegexp)) {
                return false
            } // Return true to signal that we want to use the handler.

            return true
        },
        createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
    )

    // Request handler during recording mode: ALL requests are cached
    // Handling routing: https://developers.google.com/web/tools/workbox/modules/workbox-routing#matching_and_handling_in_routes
    registerRoute(
        ({ event }) => isClientRecordingRequests(event.clientId),
        handleRecordedRequest
    )

    // If not recording, fall through to default caching strategies
    // SWR strategy for static assets that can't be precached
    registerRoute(
        ({ url }) =>
            urlMeetsDefaultCachingCriteria(url) &&
            fileExtensionRegexp.test(url.pathname),
        new StaleWhileRevalidate({ cacheName: 'other-assets' })
    )

    // Network-first caching by default
    registerRoute(
        ({ url }) => urlMeetsDefaultCachingCriteria(url),
        new NetworkFirst({ cacheName: 'app-shell' })
    )

    // Strategy for all other requests: try cache if network fails,
    // but don't add anything to cache
    class NetworkAndTryCache extends Strategy {
        _handle(request, handler) {
            return handler.fetch(request).catch(fetchErr => {
                // handler.cacheMatch doesn't work b/c it doesn't check all caches
                return caches.match(request).then(res => {
                    // If not found in cache, throw original fetchErr
                    // (if there's a cache err, that will be returned)
                    if (!res) throw fetchErr
                    return res
                })
            })
        }
    }

    setDefaultHandler(new NetworkAndTryCache())

    // * 2. Service Worker event listeners

    self.addEventListener('message', event => {
        if (!event.data) return

        // This allows the web app to trigger skipWaiting via
        // registration.waiting.postMessage({type: 'SKIP_WAITING'})
        // Paired with `clientsClaim()` at top of file.
        if (event.data.type === 'SKIP_WAITING') {
            self.skipWaiting()
        }

        if (event.data.type === 'START_RECORDING') {
            startRecording(event)
        }

        if (event.data.type === 'COMPLETE_RECORDING') {
            completeRecording(event.source.id) // same as FetchEvent.clientId
        }
    })

    // Open DB on activation
    self.addEventListener('activate', event => {
        console.log('[SW] New service worker activated')
        event.waitUntil(createDB().then(removeUnusedCaches))
    })

    // * 3. Helper functions:

    function urlMeetsDefaultCachingCriteria(url) {
        // Don't cache external requests by default
        // ? Maybe require apps to add external requests to FILES_TO_PRECACHE list?
        if (OMIT_EXTERNAL_REQUESTS && url.origin !== self.location.origin)
            return false

        // Don't cache if url matches filter in pattern list from d2.config.json
        const urlMatchesFilter = URL_FILTER_PATTERNS.some(pattern =>
            new RegExp(pattern).test(url.pathname)
        )
        if (urlMatchesFilter) return false

        return true
    }

    function createDB() {
        dbPromise = openSectionsDB()
        return dbPromise
    }

    async function removeUnusedCaches() {
        console.log('[SW] Checking for unused caches to prune...')
        const cacheKeys = await caches.keys()
        return Promise.all(
            cacheKeys.map(async key => {
                const isWorkboxKey = /workbox/.test(key)
                const isInKeepList = !!CACHE_KEEP_LIST.find(
                    keepKey => keepKey === key
                )
                const db = await dbPromise
                const isASavedSection = !!(await db.get(SECTIONS_STORE, key))
                if (!isWorkboxKey && !isInKeepList && !isASavedSection) {
                    console.log(
                        `[SW] Cache with key ${key} is unused and will be deleted`
                    )
                    return caches.delete(key)
                }
            })
        )
    }

    // Triggered on 'START_RECORDING' message
    function startRecording(event) {
        console.log('[SW] Starting recording')
        if (!event.data.payload?.sectionId)
            throw new Error('[SW] No section ID specified to record')

        const clientId = event.source.id // clientId from MessageEvent
        // Throw error if another recording is in process
        if (isClientRecording(clientId))
            throw new Error(
                "[SW] Can't start a new recording; a recording is already in process"
            )

        const newClientRecordingState = {
            sectionId: event.data.payload?.sectionId,
            pendingRequests: new Map(),
            fulfilledRequests: new Map(),
            recordingTimeout: undefined,
            recordingTimeoutDelay:
                event.data.payload?.recordingTimeoutDelay || 200,
            confirmationTimeout: undefined,
        }
        clientRecordingStates[clientId] = newClientRecordingState

        // Send confirmation message to client
        self.clients.get(clientId).then(client => {
            client.postMessage({ type: 'RECORDING_STARTED' })
        })
    }

    function isClientRecording(clientId) {
        return clientId in clientRecordingStates
    }

    function isClientRecordingRequests(clientId) {
        // Don't record requests when waiting for completion confirmation
        return (
            isClientRecording(clientId) &&
            clientRecordingStates[clientId].confirmationTimeout === undefined
        )
    }

    function handleRecordedRequest({ request, event }) {
        const recordingState = clientRecordingStates[event.clientId]

        clearTimeout(recordingState.recordingTimeout)
        recordingState.pendingRequests.set(request, 'placeholder') // Something better to put here? timestamp?

        fetch(request)
            .then(response => {
                return handleRecordedResponse(request, response, event.clientId)
            })
            .catch(error => {
                console.error(error)
                stopRecording(error, event.clientId)
            })
    }

    function handleRecordedResponse(request, response, clientId) {
        const recordingState = clientRecordingStates[clientId]
        // add response to temp cache - when recording is successful, move to permanent cache
        const tempCacheKey = getCacheKey('temp', clientId)
        addToCache(tempCacheKey, request, response)

        // add request to fulfilled
        // note that request objects can't be stored in IDB (see 'complet recording' function)
        // QUESTION: Something better to store as value? If not, an array may be appropriate
        recordingState.fulfilledRequests.set(request.url, 'placeholder-value')

        // remove request from pending requests
        recordingState.pendingRequests.delete(request)

        // start timer if pending requests are all complete
        if (recordingState.pendingRequests.size === 0)
            startRecordingTimeout(clientId)
        return response
    }

    function startRecordingTimeout(clientId) {
        const recordingState = clientRecordingStates[clientId]
        recordingState.recordingTimeout = setTimeout(
            () => stopRecording(null, clientId),
            recordingState.recordingTimeoutDelay
        )
    }

    function stopRecording(error, clientId) {
        const recordingState = clientRecordingStates[clientId]

        console.log('[SW] Stopping recording', { clientId, recordingState })
        clearTimeout(recordingState?.recordingTimeout)

        if (error) {
            // QUESTION: Anything else we should do to handle errors better?
            self.clients.get(clientId).then(client => {
                console.log('[SW] posting error message to client', client)
                client.postMessage({
                    type: 'RECORDING_ERROR',
                    payload: {
                        error,
                    },
                })
            })
            removeRecording(clientId)
            return
        }

        // Prompt client to confirm saving recording
        requestCompletionConfirmation(clientId)
    }

    function getCacheKey(...args) {
        return args.join('-')
    }

    function addToCache(cacheKey, request, response) {
        if (response.ok) {
            console.log(`[SW] Response ok - adding ${request.url} to cache`)
            const responseClone = response.clone()
            caches
                .open(cacheKey)
                .then(cache => cache.put(request, responseClone))
        }
    }

    function removeRecording(clientId) {
        console.log('[SW] Removing recording for client ID', clientId)
        // Remove recording state
        delete clientRecordingStates[clientId]
        // Delete temp cache
        const cacheKey = getCacheKey('temp', clientId)
        return caches.delete(cacheKey)
    }

    async function requestCompletionConfirmation(clientId) {
        console.log(
            '[SW] Requesting completion confirmation from client ID',
            clientId
        )
        const client = await self.clients.get(clientId)
        if (!client) {
            console.log('[SW] Client not found for ID', clientId)
            removeRecording(clientId)
            return
        }
        client.postMessage({ type: 'CONFIRM_RECORDING_COMPLETION' })
        startConfirmationTimeout(clientId)
    }

    function startConfirmationTimeout(clientId) {
        const recordingState = clientRecordingStates[clientId]
        recordingState.confirmationTimeout = setTimeout(() => {
            console.warn(
                '[SW] Completion confirmation timed out. Clearing recording for client',
                clientId
            )
            removeRecording(clientId)
        }, 10000)
    }

    // Triggered by 'COMPLETE_RECORDING' message
    async function completeRecording(clientId) {
        const recordingState = clientRecordingStates[clientId]
        console.log('[SW] Completing recording', { clientId, recordingState })
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
        const db = await dbPromise
        db.put(SECTIONS_STORE, {
            // Note that request objects can't be stored in the IDB
            // https://stackoverflow.com/questions/32880073/whats-the-best-option-for-structured-cloning-of-a-fetch-api-request-object
            sectionId: recordingState.sectionId, // the key path
            lastUpdated: new Date(),
            requests: recordingState.fulfilledRequests,
        }).catch(console.error)

        // Clean up
        removeRecording(clientId)

        // Send confirmation message to client
        self.clients.get(clientId).then(client => {
            client.postMessage({ type: 'RECORDING_COMPLETED' })
        })
    }
}
