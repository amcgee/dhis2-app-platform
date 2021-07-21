import {
    deleteSectionsDB,
    openSectionsDB,
    SECTIONS_STORE,
} from '../lib/sections-db'

const CACHE_KEEP_LIST = ['other-assets', 'app-shell']
// Fallback prevents error when switching from pwa enabled to disabled
const URL_FILTER_PATTERNS = JSON.parse(
    process.env.REACT_APP_DHIS2_APP_PWA_CACHING_PATTERNS_TO_OMIT || '[]'
)
const OMIT_EXTERNAL_REQUESTS =
    process.env.REACT_APP_DHIS2_APP_PWA_CACHING_OMIT_EXTERNAL_REQUESTS ===
    'true'

/** Called if the `pwaEnabled` env var is not `true` */
export function setUpKillSwitchServiceWorker() {
    // A simple, no-op service worker that takes immediate control and tears
    // everything down. Has no fetch handler.
    self.addEventListener('install', () => {
        self.skipWaiting()
    })

    self.addEventListener('activate', async () => {
        console.log('Removing previous service worker')
        // Unregister, in case app doesn't
        self.registration.unregister()
        // Delete all caches
        const keys = await self.caches.keys()
        await Promise.all(keys.map(key => self.caches.delete(key)))
        // Delete DB
        await deleteSectionsDB()
        // Force refresh all windows
        const clients = await self.clients.matchAll({ type: 'window' })
        clients.forEach(client => client.navigate(client.url))
    })
}

export function urlMeetsDefaultCachingCriteria(url) {
    // Don't cache if pwa.caching.omitExternalRequests in d2.config is true
    if (OMIT_EXTERNAL_REQUESTS && url.origin !== self.location.origin) {
        return false
    }

    // Don't cache if url matches filter in pattern list from d2.config.js
    const urlMatchesFilter = URL_FILTER_PATTERNS.some(pattern =>
        new RegExp(pattern).test(url.pathname)
    )
    if (urlMatchesFilter) {
        return false
    }

    return true
}

/** Called upon SW activation */
export function createDB() {
    const dbPromise = openSectionsDB()
    self.dbPromise = dbPromise
    return dbPromise
}

/** Called upon SW activation */
export async function removeUnusedCaches() {
    const cacheKeys = await caches.keys()
    return Promise.all(
        cacheKeys.map(async key => {
            const isWorkboxKey = /workbox/.test(key)
            const isInKeepList = !!CACHE_KEEP_LIST.find(
                keepKey => keepKey === key
            )
            const db = await self.dbPromise
            const isASavedSection = !!(await db.get(SECTIONS_STORE, key))
            if (!isWorkboxKey && !isInKeepList && !isASavedSection) {
                console.debug(
                    `[SW] Cache with key ${key} is unused and will be deleted`
                )
                return caches.delete(key)
            }
        })
    )
}
