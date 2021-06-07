const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const { plugin } = require('../plugin')

const createTestFilePath = fileName => path.join(__dirname, 'plugin', fileName)
const readTestFile = _fileName => {
    const fileName = path.join(..._fileName.split('/'))
    const filePath = createTestFilePath(fileName)
    return fs.readFileSync(filePath, { encoding: 'utf8' })
}

const transform = code => {
    const result = babel.transformSync(code, {
        plugins: [plugin],
    })

    // Vim (and oder editors/IDEs) automatically appends empty lines.
    // So the file with the expected code has an empty line.
    // Needs to be taken into account with the generated code
    return `${result.code}\n`
}

describe('plugin', () => {
    describe('Success', () => {
        it('should provide the default values of the variables in the params function', () => {
            const inputCode = readTestFile('success-queries/default-values.js')
            const outputCode = readTestFile(
                'success-queries/default-values.transformed.js'
            )
            expect(transform(inputCode)).toBe(outputCode)
        })

        it('should provide handle nested fields correctly', () => {
            const inputCode = readTestFile('success-queries/nested-fields.js')
            const outputCode = readTestFile(
                'success-queries/nested-fields.transformed.js'
            )
            expect(transform(inputCode)).toBe(outputCode)
        })

        it('should handle nested resource params correctly', () => {
            const inputCode = readTestFile(
                'success-queries/complex-resource-params.js'
            )
            const outputCode = readTestFile(
                'success-queries/complex-resource-params.transformed.js'
            )
            expect(transform(inputCode)).toBe(outputCode)
        })

        it('should handle multiple resources correctly', () => {
            const inputCode = readTestFile(
                'success-queries/multiple-resources.js'
            )
            const outputCode = readTestFile(
                'success-queries/multiple-resources.transformed.js'
            )
            expect(transform(inputCode)).toBe(outputCode)
        })
    })
})
