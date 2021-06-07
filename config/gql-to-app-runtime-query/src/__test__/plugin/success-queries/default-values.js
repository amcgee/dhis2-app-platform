import { gql } from '@dhis2/app-runtime'

const query = gql`
    query queryName(
        $str: String = "test",
        $int: Int = 42,
        $float: Float = 4.2,
        $boolTrue: Boolean = true,
        $boolFalse: Boolean = false,
        $arr: Array = [
            "test",
            42,
            4.2,
            true,
            false,
            { foo: "foo" },
            [{ bar: "bar" }]
        ],
        $obj: Object = {
            str: "test",
            int: 42,
            float: 4.2,
            boolTrue: true,
            boolFalse: false,
            foo: [
                "test",
                42,
                4.2,
                true,
                false,
                { foo: "foo" },
                [{ bar: "bar" }]
            ],
            bar: {
                baz: "baz"
            },
        }
    ) {
        SmsCommand(
            resource: "smsCommands",
            params: {
                str: $str,
                int: $int,
                arr: $arr,
                obj: $obj,
                boolTrue: $boolTrue,
                boolFalse: $boolFalse,
                float: $float,
            }
        ) {
            __all
        }
    }
`
