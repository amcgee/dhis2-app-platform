const { exec } = require('@dhis2/cli-helpers-engine')
const bootstrap = require('./bootstrap')
const getEnv = require('./env')

module.exports = ({ config, paths }) => ({
    bootstrap: async (args = {}) => {
        await bootstrap(paths, args)
    },
    // link: async srcPath => {
    //   reporter.info('Linking app into appShell');
    //   await fs.symlink(srcPath, paths.shellApp);
    // },
    build: async () => {
        await exec({
            cmd: 'yarn',
            args: ['run', 'build'],
            cwd: paths.shell,
            env: getEnv({
                name: config.title,
                pwa_enabled: config.pwa && config.pwa.enabled,
            }),
            pipe: false,
        })
    },
    start: async ({ port }) => {
        await exec({
            cmd: 'yarn',
            args: ['run', 'start'],
            cwd: paths.shell,
            env: getEnv({ name: config.title, port }),
            pipe: false,
        })
    },
    test: async () => {
        await exec({
            cmd: 'yarn',
            args: ['run', 'test', '--', '--all'],
            cwd: paths.shell,
            env: getEnv({ name: config.title }),
            pipe: true,
        })
    },
})
