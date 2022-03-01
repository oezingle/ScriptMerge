const ScriptMerge = importModule('ScriptMerge')

const fs = importModule('HardenedFS').local()

const main = () => {
    const dir = fs.directory(module.filename)

    const dist = `${dir}/../dist`

    // Double check dist dir exists
    if (!fs.fileExists(dist)) {
        fs.createDirectory(dist)
    }

    let sm = ScriptMerge.fromFile(
        `${dir}/ScriptMerge.js`,
        {
            debug: true,
            minify: true,
            benchmark: true
        }
    )

    const generated = sm.run()

    console.log("Writing built file")

    fs.writeString(`${dist}/ScriptMerge.js`, generated)
}

main()