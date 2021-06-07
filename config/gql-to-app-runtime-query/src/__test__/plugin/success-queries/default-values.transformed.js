import { gql } from '@dhis2/app-runtime';
const query = {
  SmsCommand: {
    resource: "smsCommands",
    params: ({
      str = "test",
      int = 42,
      float = 4.2,
      boolTrue = true,
      boolFalse = false,
      arr = ["test", 42, 4.2, true, false, {
        foo: "foo"
      }, [{
        bar: "bar"
      }]],
      obj = {
        str: "test",
        int: 42,
        float: 4.2,
        boolTrue: true,
        boolFalse: false,
        foo: ["test", 42, 4.2, true, false, {
          foo: "foo"
        }, [{
          bar: "bar"
        }]],
        bar: {
          baz: "baz"
        }
      }
    }) => ({
      fields: ["*"],
      str: str,
      int: int,
      arr: arr,
      obj: obj,
      boolTrue: boolTrue,
      boolFalse: boolFalse,
      float: float
    })
  }
};
