import { gql } from '@dhis2/app-runtime'

const query = gql`
    query queryName {
        SmsCommand(resource: "smsCommands") {
            id
            displayName
            dataElements {
                id
                displayName
                dataSets {
                    id
                    displayName
                }
            }
            smsCodes {
                code
                optionId
            }
        }
    }
`
