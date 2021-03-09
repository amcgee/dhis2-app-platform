import browserslist from '@dhis2/browserslist-config'
import postcssFlexbugsFixes from 'postcss-flexbugs-fixes'
import postcssNormalize from 'postcss-normalize'
import postcssPresetEnv from 'postcss-preset-env'
import postcss from 'rollup-plugin-postcss'

export default ({ mode }) =>
    postcss({
        extract: false, // TODO: extract and load with SystemJS css loader
        autoModules: true,
        namedExports: true,
        minimize: true,
        plugins: [
            // Compatible with create-react-app PostCSS support
            // See https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js#L134-L149
            postcssFlexbugsFixes,
            postcssPresetEnv({
                browsers: browserslist,
                autoprefixer: {
                    flexbox: 'no-2009',
                },
                stage: 3,
            }),
            postcssNormalize({
                browsers: browserslist,
            }),
        ],
        sourceMap: mode === 'production' ? false : 'inline',
    })
