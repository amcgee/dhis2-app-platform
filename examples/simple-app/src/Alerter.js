import { useAlert } from '@dhis2/app-runtime'
import { InputField, CheckboxField, Button } from '@dhis2/ui'
import React, { useState } from 'react'

export const Alerter = () => {
    const [message, setMessage] = useState('')
    const [critical, setCritical] = useState(false)

    const { show, hide } = useAlert(
        str => str,
        () => ({ critical })
    )

    return (
        <div>
            <InputField
                placeholder="Type alert message"
                value={message}
                onChange={({ value }) => setMessage(value)}
            />
            <CheckboxField
                label="Critical"
                checked={critical}
                onChange={() => setCritical(!critical)}
            />
            <Button onClick={() => show(message)}>Show alert</Button>
            <Button onClick={hide}>Hide permanent message</Button>
            <style jsx>{`
                div {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 600px;
                }
            `}</style>
        </div>
    )
}
