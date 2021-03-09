import { terser } from 'rollup-plugin-terser'

export default () =>
    terser({
        output: {
            comments(node, comment) {
                return comment.value.trim().startsWith('react@')
            },
        },
    })
