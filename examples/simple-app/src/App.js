import { useDataQuery } from '@dhis2/app-runtime'
import moment from 'moment'
import React from 'react'
import { Alerter } from './Alerter.js'
import { container } from './App.module.css'
import i18n from './locales'

const query = {
    me: {
        resource: 'me',
    },
}

const Component = () => {
    const { error, loading, data } = useDataQuery(query)
    return (
        <div className={container}>
            {error && <span>ERROR</span>}
            {loading && <span>...</span>}
            {data && (
                <>
                    <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
                    <h3>
                        {i18n.t('Have a great {{dayOfTheWeek}}!', {
                            dayOfTheWeek: moment.weekdays(true)[
                                moment().weekday()
                            ],
                        })}
                    </h3>
                    <Alerter />
                </>
            )}
        </div>
    )
}

export default Component
