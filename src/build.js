
const ScriptMerge = importModule('ScriptMerge')

const fs = importModule('HardenedFS').local()

const main = () => {
    let sm = ScriptMerge.fromFile(
        `${fs.directory(module.filename)}/ScriptMerge.js`,
        {
            debug: true,
            minify: true,
            benchmark: true
        }
    )

    const generated = sm.run()

    // Check if running under node
    if (typeof require != 'undefined') {
        const nodefs = require('fs')

        // TODO write .scriptable too!
        nodefs.writeFileSync(`${fs.directory(module.filename)}/../dist/ScriptMerge.js`, Buffer.from(generated, 'utf-8'))
    }
}

main()