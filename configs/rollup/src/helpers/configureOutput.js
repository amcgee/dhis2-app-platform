import terser from '../plugins/terser.js'

export const configureOutput = ({ name, mode, dir, globals, format }) => {
    const isProduction = mode === 'production'

    return {
        entryFileNames: `[name].[hash].${format}${
            isProduction ? '.min.js' : '.js'
        }`,
        chunkFileNames: x => {
            return `${name}.chunk-${x.name}.[hash].${format}${
                isProduction ? '.min.js' : '.js'
            }`
        },
        format,
        name: format === 'umd' ? name : undefined,
        dir,
        globals,
        sourcemap: true,
        banner: `/* ${name} ${mode} version */`,
        interop: 'auto',
        plugins: [isProduction && terser()],
    }
}
