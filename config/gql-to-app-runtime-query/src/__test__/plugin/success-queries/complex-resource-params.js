import { gql } from '@dhis2/app-runtime'

const query = gql`
    query queryName(
        $id: ID!
        $test: String = "test"
        $int: Int = 42
        $float: Float = 42.42
        $bool: Boolean = false
        $foo: Object = { foo: "bar", bar: { baz: "baz" } }
        $bar: Array = ["foo", "bar"]
    ) {
        SmsCommand(
            resource: "smsCommands"
            id: $id
            params: {
                test: $test
                paging: "false"
                int: $int
                int2: 42
                float: $float
                floats: 13.37
                bool: $bool
                bools: true
                obj: { key1: "str", key2: 42, key3: { key4: $bar } }
                array: [
                    { arrKey1: "arrVal1", arrKey2: "arrVal2" }
                    "arr1"
                    "arr2"
                    ["arr3.1", "arr3.2"]
                ]
            }
            data: { foo: $foo, bar: { baz: "foobar" } }
            other: { foo: "foo", bar: { baz: "baz" } }
        ) {
            __all
        }
    }
`
