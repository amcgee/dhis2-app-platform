import babelConfigFactory from '@dhis2/config-babel/configFactory'
import { babel } from '@rollup/plugin-babel'

export default ({ mode }) =>
    babel({
        ...babelConfigFactory({ mode, moduleType: 'es' }),
        babelHelpers: 'bundled', // TODO: Shared babel helpers
        exclude: 'node_modules/**',
    })
