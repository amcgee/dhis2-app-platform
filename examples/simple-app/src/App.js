import { gql, useDataQuery } from '@dhis2/app-runtime'
import moment from 'moment'
import React from 'react'
import { Alerter } from './Alerter.js'
import style from './App.style'
import i18n from './locales'

const queryId = gql`
    query {
        me(resource: "me") {
            id
        }
    }
`

const query = {
    me: {
        resource: 'me',
    },
}

const Component = () => {
    const { error, loading, data } = useDataQuery(query)
    const { error: errorId, loading: loadingId, data: dataId } = useDataQuery(
        queryId
    )

    return (
        <div>
            <style jsx>{style}</style>
            {error && <span>ERROR</span>}
            {errorId && <span>ERROR ID</span>}
            {(loading || loadingId) && <span>...</span>}
            {data && (
                <>
                    <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
                    <h2>
                        {i18n.t('Have a great {{dayOfTheWeek}}!', {
                            dayOfTheWeek: moment.weekdays(true)[
                                moment().weekday()
                            ],
                        })}
                    </h2>

                    {dataId && <h3>Id of me: {dataId.me.id}</h3>}

                    <Alerter />
                </>
            )}
        </div>
    )
}

export default Component
