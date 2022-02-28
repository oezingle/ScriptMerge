
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
}

main()