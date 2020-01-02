## [3.0.2](https://github.com/dhis2/app-platform/compare/v3.0.1...v3.0.2) (2019-12-20)


### Bug Fixes

* add an eslint config to shell, falling back to react-app defaults ([#222](https://github.com/dhis2/app-platform/issues/222)) ([2c7deae](https://github.com/dhis2/app-platform/commit/2c7deaea257a0b0780a2b5372335219a9a302d52))

## [3.0.1](https://github.com/dhis2/app-platform/compare/v3.0.0...v3.0.1) (2019-12-20)


### Bug Fixes

* correctly set custom and fallback port settings ([#223](https://github.com/dhis2/app-platform/issues/223)) ([c2ac04c](https://github.com/dhis2/app-platform/commit/c2ac04c49533e7b497f1246c9b730fc92bdeff3c))

# [3.0.0](https://github.com/dhis2/app-platform/compare/v2.0.0...v3.0.0) (2019-12-09)


### Features

* **deps:** upgrade @dhis2/ui-core to 4.1.1 and @dhis2/ui-widgets to 2.0.4 ([#198](https://github.com/dhis2/app-platform/issues/198)) ([07c2187](https://github.com/dhis2/app-platform/commit/07c2187e75a25e1a45484fcbc63c6bc3572e4f32))


### BREAKING CHANGES

* **deps:** This will break applications which use the v3 API of `@dhis2/ui-core` components

# [2.0.0](https://github.com/dhis2/app-platform/compare/v1.5.10...v2.0.0) (2019-11-28)


### Features

* remove rollup application compiler, delegate compilation to the shell ([#187](https://github.com/dhis2/app-platform/issues/187)) ([cae7a07](https://github.com/dhis2/app-platform/commit/cae7a070209e1e06e2e363ee24876ec8bf636d25))


### BREAKING CHANGES

* This may break some applications which use the former named import workaround, but removing that workaround should make treeshaking work!!

## [1.5.10](https://github.com/dhis2/app-platform/compare/v1.5.9...v1.5.10) (2019-11-22)


### Bug Fixes

* upgrade @dhis2/cli-helpers-engine to 1.5.0 ([#176](https://github.com/dhis2/app-platform/issues/176)) ([83e8a92](https://github.com/dhis2/app-platform/commit/83e8a92d0f5869bfa6342517202282c2db203137))

## [1.5.9](https://github.com/dhis2/app-platform/compare/v1.5.8...v1.5.9) (2019-11-14)


### Bug Fixes

* use Provider instead of DataProvider ([#163](https://github.com/dhis2/app-platform/issues/163)) ([ece9424](https://github.com/dhis2/app-platform/commit/ece94247eb3186369ac5750badb47859438036b4))

## [1.5.8](https://github.com/dhis2/app-platform/compare/v1.5.7...v1.5.8) (2019-11-12)


### Bug Fixes

* upgrade Headerbar to 2.0.1, don't break on older servers ([#162](https://github.com/dhis2/app-platform/issues/162)) ([b520448](https://github.com/dhis2/app-platform/commit/b520448da85a32ed0b50edbed5357aad2e6cd9cc))

## [1.5.7](https://github.com/dhis2/app-platform/compare/v1.5.6...v1.5.7) (2019-11-06)


### Bug Fixes

* update yarn.lock, otherwise install fails with cryptic error ([#150](https://github.com/dhis2/app-platform/issues/150)) ([5e5e668](https://github.com/dhis2/app-platform/commit/5e5e668c95f883bffa7e6a7616297ac590e9fea9))

## [1.5.6](https://github.com/dhis2/app-platform/compare/v1.5.5...v1.5.6) (2019-11-06)


### Bug Fixes

* upgrade @dhis2/app-runtime to v2.0.4 ([#148](https://github.com/dhis2/app-platform/issues/148)) ([c217c18](https://github.com/dhis2/app-platform/commit/c217c1895ffecb8425b762e6c6b4f2aff32b1f0a))

## [1.5.5](https://github.com/dhis2/app-platform/compare/v1.5.4...v1.5.5) (2019-10-21)


### Bug Fixes

* use browser field in package.json if it exists ([#129](https://github.com/dhis2/app-platform/issues/129)) ([33742cc](https://github.com/dhis2/app-platform/commit/33742cceeb192de0387753cf0ff8dd0f228ad28e))

## [1.5.4](https://github.com/dhis2/app-platform/compare/v1.5.3...v1.5.4) (2019-10-16)


### Bug Fixes

* detect an occupied port and find an open one ([#122](https://github.com/dhis2/app-platform/issues/122)) ([a2b1a00](https://github.com/dhis2/app-platform/commit/a2b1a0001ae792c8c510942400350166c0ed8be0))

## [1.5.3](https://github.com/dhis2/app-platform/compare/v1.5.2...v1.5.3) (2019-10-03)


### Bug Fixes

* make i18n consistently functional ([#98](https://github.com/dhis2/app-platform/issues/98)) ([291980a](https://github.com/dhis2/app-platform/commit/291980a))

## [1.5.2](https://github.com/dhis2/app-platform/compare/v1.5.1...v1.5.2) (2019-10-03)


### Bug Fixes

* don't dynamically load the app adapter (prevent blank flash) ([#97](https://github.com/dhis2/app-platform/issues/97)) ([5d2d491](https://github.com/dhis2/app-platform/commit/5d2d491))

## [1.5.1](https://github.com/dhis2/app-platform/compare/v1.5.0...v1.5.1) (2019-09-30)


### Bug Fixes

* **deps:** upgrade @dhis2/app-runtime to 2.0.2 ([61b8a62](https://github.com/dhis2/app-platform/commit/61b8a62))

# [1.5.0](https://github.com/dhis2/app-platform/compare/v1.4.5...v1.5.0) (2019-09-30)


### Features

* add support for standalone mode (default in development) ([#70](https://github.com/dhis2/app-platform/issues/70)) ([485b6da](https://github.com/dhis2/app-platform/commit/485b6da))

## [1.4.5](https://github.com/dhis2/app-platform/compare/v1.4.4...v1.4.5) (2019-09-30)


### Bug Fixes

* don't drop .gitignore lines that aren't in a section ([#88](https://github.com/dhis2/app-platform/issues/88)) ([7372a0c](https://github.com/dhis2/app-platform/commit/7372a0c))

## [1.4.4](https://github.com/dhis2/app-platform/compare/v1.4.3...v1.4.4) (2019-09-27)


### Bug Fixes

* update gitignore on init ([#71](https://github.com/dhis2/app-platform/issues/71)) ([e91d71f](https://github.com/dhis2/app-platform/commit/e91d71f))

## [1.4.3](https://github.com/dhis2/app-platform/compare/v1.4.2...v1.4.3) (2019-09-25)


### Bug Fixes

* allow env var override of api version ([#67](https://github.com/dhis2/app-platform/issues/67)) ([dc1b6df](https://github.com/dhis2/app-platform/commit/dc1b6df))

## [1.4.2](https://github.com/dhis2/app-platform/compare/v1.4.1...v1.4.2) (2019-09-24)


### Bug Fixes

* upgrade app-runtime to 2.0.1 ([d2c0c13](https://github.com/dhis2/app-platform/commit/d2c0c13))

## [1.4.1](https://github.com/dhis2/app-platform/compare/v1.4.0...v1.4.1) (2019-09-24)


### Bug Fixes

* upgrade app-runtime to 2.0 ([#65](https://github.com/dhis2/app-platform/issues/65)) ([239dd19](https://github.com/dhis2/app-platform/commit/239dd19))

# [1.4.0](https://github.com/dhis2/app-platform/compare/v1.3.1...v1.4.0) (2019-09-24)


### Features

* improve test command, support dotenv files, add postcss ([#52](https://github.com/dhis2/app-platform/issues/52)) ([210c9cc](https://github.com/dhis2/app-platform/commit/210c9cc))

## [1.3.1](https://github.com/dhis2/app-platform/compare/v1.3.0...v1.3.1) (2019-09-17)


### Bug Fixes

* remove publish-breaking comment from package.json ([#47](https://github.com/dhis2/app-platform/issues/47)) ([c45d97a](https://github.com/dhis2/app-platform/commit/c45d97a))

# [1.3.0](https://github.com/dhis2/app-platform/compare/v1.2.3...v1.3.0) (2019-09-10)


### Features

* generate a manifest, set PUBLIC_URL, and output a compliant zip ([#36](https://github.com/dhis2/app-platform/issues/36)) ([243454a](https://github.com/dhis2/app-platform/commit/243454a))

## [1.2.3](https://github.com/dhis2/app-platform/compare/v1.2.2...v1.2.3) (2019-09-06)


### Bug Fixes

* improve start behavior and logging, don't orphan react-scripts, add postcss ([#34](https://github.com/dhis2/app-platform/issues/34)) ([f9edd31](https://github.com/dhis2/app-platform/commit/f9edd31))

## [1.2.2](https://github.com/dhis2/app-platform/compare/v1.2.1...v1.2.2) (2019-09-05)


### Bug Fixes

* show compilation errors when watching for changes ([#30](https://github.com/dhis2/app-platform/issues/30)) ([7bbdd5c](https://github.com/dhis2/app-platform/commit/7bbdd5c))

## [1.2.1](https://github.com/dhis2/app-platform/compare/v1.2.0...v1.2.1) (2019-08-28)


### Bug Fixes

* restore test command and deal with standard deps ([#13](https://github.com/dhis2/app-platform/issues/13)) ([5745c21](https://github.com/dhis2/app-platform/commit/5745c21))

# [1.2.0](https://github.com/dhis2/app-platform/compare/v1.1.3...v1.2.0) (2019-08-27)


### Features

* show off more features when initing a new app ([13cb4f1](https://github.com/dhis2/app-platform/commit/13cb4f1))

## [1.1.3](https://github.com/dhis2/app-platform/compare/v1.1.2...v1.1.3) (2019-08-27)


### Bug Fixes

* build adapter before bundling ([861844f](https://github.com/dhis2/app-platform/commit/861844f))

## [1.1.2](https://github.com/dhis2/app-platform/compare/v1.1.1...v1.1.2) (2019-08-27)


### Bug Fixes

* use a flat workspaces array ([6b6a7be](https://github.com/dhis2/app-platform/commit/6b6a7be))

## [1.1.1](https://github.com/dhis2/app-platform/compare/v1.1.0...v1.1.1) (2019-08-27)


### Bug Fixes

* create a subdirectory on init, publish scripts package ([7979627](https://github.com/dhis2/app-platform/commit/7979627))

# [1.1.0](https://github.com/dhis2/app-platform/compare/v1.0.0...v1.1.0) (2019-08-27)


### Features

* publish at d2-app-scripts, add init command ([ef6009c](https://github.com/dhis2/app-platform/commit/ef6009c))

# 1.0.0 (2019-08-27)

Initial release!
