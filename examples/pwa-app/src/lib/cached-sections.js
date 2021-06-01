import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useOfflineInterface } from './offline-interface.js'

const CachedSectionsContext = createContext()

/**
 * Uses the offline interface to access a Map of cached section IDs to their
 * last updated time. Provides that list, a 'removeSection(id)' function, and
 * an 'updateSections' function as context.
 */
export function CachedSectionsProvider({ children }) {
    const { show } = useAlert(
        ({ message }) => message,
        ({ props }) => ({ ...props })
    )
    const offlineInterface = useOfflineInterface()

    // cachedSections = Map: id => lastUpdated
    const [cachedSections, setCachedSections] = useState(new Map())

    // Get cached sections on load (and on other events?)
    useEffect(() => {
        // ! yikes! currently this creates a DB even if PWA is not enabled.
        // TODO: Only 'fetch' sections if PWA is enabled
        // check offlineInterface.initialized? .pwaEnabled? and add as dependency so it triggers on change
        updateSections()
    }, [])

    async function updateSections() {
        const list = await offlineInterface.getCachedSections()
        const map = new Map()
        list.forEach(section => map.set(section.sectionId, section.lastUpdated))
        setCachedSections(map)
    }

    async function removeSection(id) {
        return offlineInterface
            .removeSection(id)
            .then(success => {
                if (success) {
                    const options = {
                        message: i18n.t(
                            'Section removed from offline storage.'
                        ),
                        props: { success: true },
                    }
                    show(options)
                    updateSections()
                } else {
                    const options = {
                        message: i18n.t(
                            'That section was not found in offline storage.'
                        ),
                    }
                    show(options)
                    // No need to update sections here
                }

                return success
            })
            .catch(err => {
                const options = {
                    message: i18n.t(
                        'There was an error when trying to remove this section. {{-msg}}',
                        { msg: err.message }
                    ),
                    props: { critical: true },
                }
                console.error(err)
                show(options)
            })
    }

    const context = {
        cachedSections,
        removeSection,
        updateSections,
    }

    return (
        <CachedSectionsContext.Provider value={context}>
            {children}
        </CachedSectionsContext.Provider>
    )
}

CachedSectionsProvider.propTypes = {
    children: PropTypes.node,
}

/**
 * Access info and operations related to all cached sections.
 * @returns {Object} { cachedSections: Map, removeSection: func(id), updateSections: func() }
 */
export function useCachedSections() {
    const context = useContext(CachedSectionsContext)

    if (context === undefined) {
        throw new Error(
            'useCachedSections must be used within a CachedSectionsProvider'
        )
    }

    return context
}

/**
 * Accesses info and operations related to a single cached section.
 * @param {string} id - Section ID of a cached section
 * @returns {Object} { isCached: boolean, lastUpdated: Date, remove: func(), updateSections: func() }
 */
export function useCachedSection(id) {
    const context = useContext(CachedSectionsContext)

    if (context === undefined) {
        throw new Error(
            'useCachedSection must be used within a CachedSectionsProvider'
        )
    }

    const { cachedSections, removeSection, updateSections } = context

    const lastUpdated = cachedSections.get(id) // might be undefined
    const isCached = !!lastUpdated
    const remove = () => removeSection(id)

    return {
        isCached,
        lastUpdated,
        remove,
        updateSections,
    }
}
