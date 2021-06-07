import { gql } from '@dhis2/app-runtime';
const query = {
  SmsCommand: {
    resource: "smsCommands",
    params: ({}) => ({
      fields: ["id", "displayName", "dataElements[id,displayName,dataSets[id,displayName]]"]
    })
  },
  DataElement: {
    resource: "dataElements",
    params: ({}) => ({
      fields: ["id", "displayName", "dataSetElements[categoryCombo[*]]"]
    })
  }
};
