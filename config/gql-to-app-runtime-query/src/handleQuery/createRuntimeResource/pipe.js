const pipe = (...fns) => (...args) => {
    if (!fns.length) return
    return fns.slice(1).reduce((acc, fn) => fn(acc), fns[0](...args))
}

module.exports.pipe = pipe
