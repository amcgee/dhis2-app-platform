import { gql } from '@dhis2/app-runtime';
const query = {
  SmsCommand: {
    resource: "smsCommands",
    params: ({}) => ({
      fields: ["id", "displayName", "dataElements[id,displayName,dataSets[id,displayName]]", "smsCodes[code,optionId]"]
    })
  }
};
