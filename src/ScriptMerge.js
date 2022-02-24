// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic; share-sheet-inputs: file-url;
// TODO: module vars should sometimes not be declared as let

// TODO: doesn't support jquery-style namespacing:
/*
((exports) => {
  exports = {}
})(module.exports || {})
*/

/*
Changelog
1.1.0
  - simplified Spider behavior 
     - breaks: any recursive use of spider
  - improved dependency ranking
     - switched from tree depth rating to topigraphical sort  
  - script now removes unused modules
     - bootstrapped file is smaller
     - any module that doesn't take part in a global variable is stripped from the dependency tree
  - fixed a bug detecting object syntax
*/

/*
TODO: leaks memory or something:

Bootstrap benchmark
0. 1.534
1. 1.535
2. 1.776
3. 1.636
4. 1.653
5. 1.723
6. 1.882
7. 2.394
8. 2.581
9. 2.544
*/

// Disabled: Debugging-only
//importModule = importModule("tryImport")

const HardenedFS = importModule("HardenedFS")

const BracketBuffer = importModule("BracketBuffer")

const StringRemover = importModule("StringRemover")

const minify = importModule("minify")

// Disabled: Broken
//const obfuscate = importModule("obfuscate")

const escapeForRegex = importModule("escapeForRegex")

const uuidGen = importModule("uuidGen")

const AlertFactory = importModule("AlertFactory")

const tsort = importModule("tsort")

const Benchmark = importModule("Benchmark")

const {configureObject, ConfigurationPresets} = importModule("configureObject")

const fs = HardenedFS.iCloud()

const buildPath = (path) => fs.path(path)






/**
 * Main class
 *  - fromFile
 *  - gui
 **/
const ScriptMerge = class {
  static defaultSettings = {
    debug: false,
    minify: true,
    //obfuscate: false,
    benchmark: false,
    plugins: []
  }
  
  static fromFile (path, settings) {
    const content = fs.readString(path)
    
    return new this(content, settings)
  }
  
  constructor (content, settings) {
    this.content = content
    this.settings = {
      ...this.constructor.defaultSettings,
      ...settings
    }
    
    this.runtime = {}
    
    if (this.settings.debug)
      console.log("[ScriptMerge] Debugger Enabled")
    
    this.settings.plugins.forEach(plugin => {
      this.addToToolChain(
        plugin.step, 
        plugin.function
      )
      
      if (this.settings.debug)
        console.log(`[ScriptMerge] Added Plugin ${plugin.name ?? "(unknown)"}`)
    })
  }
  
  run_add_depend(path, depend) {
    this.runtime.depends.push([
      path, depend
    ])
  }
  
  run_get_module(path) {
    if (this.runtime.modules[path]) return
    
    const local = path.replace(fs.documentsDirectory(), "")
    
    if (this.settings.debug) {
      console.log(`[ScriptMerge] Merging module: ${local}`)
    }
    
    if (this.settings.benchmark)
      this.runtime.modulebm.step(`Module ${local}`)
    
    let mod = new Module(fs.readString(path))
    
    if (this.settings.benchmark)
      this.runtime.modulebm.step(`Spider ${local}`)
    
    const spider = new Spider(mod.exported)
    
    // Replace w/ absolute path imports
    mod.exported = spider.content

    this.runtime.modules[path] = mod
    
    spider.depends.forEach(depend => {
      this.run_add_depend(path, depend)
      this.run_get_module(depend)
    })
  }
  
  run_tsort() {
    const deps = tsort(this.runtime.depends)
    
    this.runtime.dependsOrdered = deps
  }
  
  run_remove_imports () {
    Object.entries(this.runtime.modules)  
      .forEach(([path, mod]) => {
        this.runtime.output =
          this.runtime.output
            .replaceAll(
              `importModule("${path}")`,
              mod.exportName
            )
      })
  }
  
  run () {
    this.runtime = {
      modules: {},
      depends: [],
      dependsOrdered: [],
      output: ""
    }
    
    const bm = new Benchmark()
    
    if (this.settings.benchmark) {
      bm.start()
      
      bm.step("Spider")
      
      this.runtime.modulebm = new Benchmark("Dependency Collection")  
      this.runtime.modulebm.start()
      
      this.runtime.modulebm.step("Spider root")
    }
    
    this.runtime.spider = new Spider(this.content)

    this.runtime.spider.depends.forEach(depend => {  
      this.run_add_depend("root", depend)
      this.run_get_module(depend)
    })
    
    if (this.settings.benchmark) {
      this.runtime.modulebm.finish()
    
      bm.step("Dependency Sort")
    }
    
    this.run_tsort()
    
    if (this.settings.benchmark)
      bm.step("Add Content")
    
    this.runtime.dependsOrdered.forEach(dep=>{
      if (dep === "root") return
      
      this.runtime.output += this.runtime.modules[dep].exported
  
      if (this.settings.debug) {
        this.runtime.output += "\n\n"
      }
    })
    
    let root = this.runtime.spider.content
    
    // Remove scriptable vars
    while (root.substr(0, 2) == "//") {
      root = root.substring(
        root.indexOf("\n")
      )
    }
    
    this.runtime.output += root
    
    if (this.settings.benchmark)
      bm.step("Remove importModule calls")
    
    this.run_remove_imports()
    
    // Minfy if needed
    if (this.settings.minify) {
      if (this.settings.debug)
        console.log("[ScriptMerge] Minifying")
      
      if (this.settings.benchmark)
        bm.step("Minify")
      
      this.runtime.output = minify(
        this.runtime.output
      )
    }
    
    if (this.settings.benchmark) {
      bm.finish()
    }
    
    return this.runtime.output
  }
  
  static fromFile(path, settings) {
    const content = fs.readString(path)
    
    return new this(content, settings)
  }
  
  static ToolChainSteps = {
    // Read any file
    READ_FILE: "readFile",
  }
  
  addToToolChain(step, func, name) {
    if (!(step in this.constructor.ToolChainSteps)) {
      throw new Error("Unknown Toolchain step")
    }
    
    this.settings.plugins.push({
      step, func, name
    })
  }
 
  static gui(path) {
    const errHandle = err => {
      console.error(err)
      
      throw err
    }
    
    const namedHandle = (name) => {
      return err => {
        console.error(`In ${name}: ${err}`)
      
        throw err
      }
    }
    
    const cancel = () => {
      throw new Error("[ScriptKit] Cancelled")
    }
    
    let settings = this.defaultSettings
    
    const runMenu = async (path) => {
      const fileName = path.replace(  
        fs.directory(path) + "/", 
        ""
      )
        
      const alert = new AlertFactory("ScriptMerge - " + fileName)  
        .addAction("Run", () => {
          return true
        })
        .addAction("Settings", () => {
          return configureObject(settings, {plugins: ConfigurationPresets.hidden})
            .then(() => runMenu(path), namedHandle("Settings Menu"))
        })
        .addCancelAction("Cancel", cancel)
        
      while (true) {
        const ret = await alert.present()
          
        if (ret != undefined) {
          return {settings, path}
        }
      }
    }
    
    const setpath = async () => {
      if (path) {
        return path
      } else {
        return new AlertFactory("ScriptMerge", "A path has not been set. How would you like to continue?")  
          .addAction("Select A File", () => {
            return DocumentPicker.open([
              "com.netscape.javascript-source"
            ]).then(paths => paths[0])
          })
          .addAction("Provide a path", () => {
            return new AlertFactory("ScriptMerge - Provide a Path", "'~' can be used for the Scriptable Documents directory")  
              .addTextField("~/file.js")
              .addAction("Confirm", alert => {
                return buildPath(alert.textFieldValue(0))
              })
              .addCancelAction("Cancel", cancel)
              .present()
          })
          .addAction("User Manual", () => {  
            return QuickLook.present(`
ScriptMerge User Manual

What? Why?
ScriptMerge was created to address the need for a way to "flatten" any importModule calls in Scriptable scripts. It's the third iteration of such a project that I've worked on, and the first I'm satisfied with.

Features
 - Per-module variable prefixing
 - Dependency-only variable collection
 - module and GUI endpoints
 - built-in minification


Installing

Pre-built
ScriptMerge can be used as a pre-merged flat file. See this project's releases

Building
ScriptMerge can build itself from the collection of modules it depends upon. Either select ScriptMerge.js through the GUI or build it using the module's ScriptMerge class


Usage

GUI
The gui can be called with 
ScriptMerge.gui([path])
Omitting the path prompts the user to select a file. Once a path has been set, the user can modify the settings object or merge the script. The user then decides what to do with the merged output

ScriptMerge class
Create a ScriptMerge instance using
new ScriptMerge(<content>, [settings])
or
ScriptMerge.fromFile(<path>, [settings])
to merge the file, use a ScriptMerge instance and call run()
            `).then(cancel)
          })
          .addCancelAction("Cancel", cancel)
          .present()
      }
    }
    
    setpath()
      .then(path => {  
        if (fs.fileExists(path)) {
          return path
        } else {
          throw new Error("[ScriptMerge] Specified File Not Found")
        }
      }, errHandle)
      .then(runMenu, errHandle)
      .then(({settings, path}) => {
        return this.fromFile(path, settings)
      }, namedHandle("run menu"))
      .then(inst => {
        inst.run()
        
        return inst
      }, namedHandle("Create Instance"))
      .then(inst => {
        const output = inst.runtime.output
        
        new AlertFactory("ScriptKit - Success", "How would you like to use your merged file?")  
          .addAction("Copy To Clipboard", 
            () => Pasteboard.copy(output))
          /*.addAction("Add as a Script",()=>{
            const scriptableVars = `// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;`  
            
          })*/
          .addCancelAction("Cancel", cancel)
          .present()
      }, namedHandle("Run Instance"))
      .catch(namedHandle("Output time"))
    
  }
  
  static Plugin = class {  
    constructor (step, func, name) {
      this.step = step
      this.function = func
      this.name = name
    }
  }
}










// Enable implicit definitions of vars. 
//Can cause issues
const ENABLE_IMPLICIT_DEFINITON = false


/** 
 * Module - load an arbitrary string 
 * and work with it as if were a js module
 **/
const Module = class {
  constructor(content, debug) {
    this.debug = debug
    
    // Add empty last line
    // Fixes BBOOB if last line includes 
    //module.exports declaration
    content += '\n'
    
    this.content = ";" + minify(content)
    
    this.uuid = uuidGen()
    
    this.exportName = `SM_${this.uuid}`
    
    // replace functions with lambdas, classes
    // as constses
    this.modify()
    
    this.getExports()
  }
  
  getExports() {
    // Exported object, and its dependencies
    this.exported = ""
    
    const exports = this.getVar(  
      "module.exports"
    )
    
    let nameMap = {}
    
    if (exports) {
      let sr = new StringRemover("")
      
      //let exportsModded = exports
      
      // simple module.exports
      const depends = this.getDepends(exports)
      
      for (let key in depends) {
        const val = depends[key]
        
        if (val) {
          const name =`SM_${this.uuid}_${key}`
  
          sr.prepend(`let ${name}=${val};`)
          
          nameMap[key] = name
        }
      }
        
      sr.append(`let ${this.exportName}=${exports};`)

      Object.entries(nameMap)
        .forEach(([name, replacer]) => {
          // ligatures are breaking this one,
          // but the pattern ignores equals
          // unless its the boolean test (==)
          let r = new RegExp(`([^a-zA-Z0-9_$.])${escapeForRegex(name)}(?![=:a-zA-Z0-9_$](?!=))`, 'g')
          
          sr.setContent(
            sr.getContent()  
              .replace(r, "$1"+replacer)
          )
        })
      this.exported = sr.reinsertStrings()
    } else {
      // module.exports is probably done by an     
      // object, ie. module.exports.name = val
      
      throw new Error("Module used unsupported export scheme")
    }
    
    return this.exported
  }
  
  modify() {
    this.content = this.content
      // Named function
      .replace(/function\s+(\S+)\s*\(([^\)]*)\)/g, "const $1 = ($2) =>")  
      // Anonymous function, or
      //let name = function (...) {...}
      .replace(/function\s*\(([^\)]*)\)/g, "($1) =>")    
      // named class
      .replace(/class\s+(?!extends)(\S+)/g, "const $1 = class")

    // {name} -> {name: name}
    const r = /(?:(?:let|const|var)\s*([a-zA-Z0-9_$])|module\.exports)\s*=\s*\{/g
    
    let match
    while((match=r.exec(this.content))!=null){
      const start = match.index
      
      try {  
        const end = new     BracketBuffer(this.content, start)
          .moveUntilLineEnd()
          .moveUntilEmpty()
          .pos
          
        let slice = this.content  
          .substring(start, end)
        slice = slice.substr(slice.indexOf("{"))
        
        const original = slice
        
        // Requires 2 patterns for some reason
        slice = slice.replace(/([,{])\s*([a-zA-Z_$][a-zA-Z$_0-9]*)\s*}/g, '$1$2: $2}')
        slice = slice.replace(/([,{])\s*([a-zA-Z_$][a-zA-Z$_0-9]*)\s*,/g, '$1$2: $2,')
          
        this.content = this.content
          .replace(original, slice)
      } catch (e) {console.warn(e)}
    }
  }
  
  /**
   * Return a list of unrecognized symbols
   **/
  findDepends = this.constructor.findDepends
  static findDepends(content) {
    // TODO: actually use scope better
    
    content = new StringRemover(content)  
      .getContent()
    
    const varNameTestGen = (valid) => {  
      return `[${valid?'':'^'}a-zA-Z$_]` +
        `[${valid?'':'^'}a-zA-Z0-9_$]*`
    }
    
    const validVarName = varNameTestGen(true)
    const invalidVarName = varNameTestGen(false)
  
    const invalidVarNameR = new RegExp(invalidVarName, 'g')

    // var.sub -> var
    const dotAttr = new RegExp(
      `(${validVarName}|\.)\\s*\\.${validVarName}`, 'g'
    )
    while (content != content.replace(dotAttr, '$1')) {
      content = content
        .replace(dotAttr, '$1')
    }
    
    const jsKeywords = [
      'if', 'else', 'for', 'while', 'try',
      'catch', 'return', 'throw',
      'new', 'of', 'class', 'constructor',
      'true', 'false', 'static', 'continue',         
      'break', 'switch', 'static'
    ].concat(Object.getOwnPropertyNames(globalThis)).concat(["null"])
    
    // Remove javascript keywords
    jsKeywords.forEach(keyword => {
      const keywordRegex = new RegExp(`([^a-zA-Z0-9_$])${escapeForRegex(keyword)}(?![a-zA-Z0-9_$])`, 'g')
      
      content = content
        .replace(keywordRegex, '')
    })
    
    // remove this
    content = content
      .replace(/this\.\S+/g, "")
      .replace(/this/g, "")
      
    // remove numbers
    content = content
      .replace(/[0-9]/g, "")
    
    const decl = new RegExp(`(?:const|let|var)\\s+(${validVarName})`)
    
    let match;
    while ((match = decl.exec(content)) != null) {
//Remove the match; any variable declared   
//in the scope is already satisfied
      
//However, the value of the variable stays
//as it may contain other dependencies
//(eg, function as variable)
  
      const useOfVar = new RegExp(`${escapeForRegex(match[1])}(?![a-zA-Z0-9_])`, 'g')
      
      content = content
        // replace "const ... ="
        .replaceAll(match[0], '')
        // Replace uses of it
        .replace(useOfVar, '')
      
    }
    
    const lambda = /\(([^\)]+)\)\s*=>/g
    
    while ((match = lambda.exec(content)) != null) {
      const argumentz = match[1]
        .replace(/\s+/g, '')
        .split(',')
        
      argumentz.forEach(argument => {
        const useOfVar = new RegExp(`${escapeForRegex(argument)}(?![a-zA-Z0-9_])`, 'g')
        
        content = content
          .replace(useOfVar, '')
      })
    }
    
    content = content
      .replace(/(?:const|let|var)/g, "")
    
    content = content
      // anything not a valid name is removed
      .replace(invalidVarNameR, ' ')
      // remove duplicate whitespace
      .replace(/\s+/g, ' ')
    
    const list = [...new Set(content.split(' '))].filter(Boolean)
      
    return list
  }
  
  /**
   * Manual overload
   **/
  getDepends(listOrContent) {
    if (listOrContent instanceof Array) {
      return this.getDependsFromList(listOrContent)
    } else if (typeof listOrContent == "string") {
      return this.getDependsFromContent(listOrContent)
    }
  }
  
  getDependsFromContent(content) {
    let list = this.findDepends(content)
    
    return this.getDependsFromList(list)
  }
  
  getDependsFromList(dependencies, obj={}) {
    dependencies.forEach(name => {
      // If the object already has this 
      //dependency, skip doing it again
      if (obj[name]) return
      
      const val = this.getVar(name)
      
      obj[name] = val ? val : null
      
      if (val) {
        let subDepends = this.findDepends(val)
        
        this.getDependsFromList(
          subDepends, obj
        )
      }
    })
    
    return obj
  }
  
  getVar(name) {
    // TODO: single pattern
    
    // Sanitize by escaping characters
    const reName = escapeForRegex(name)
    
    // Explicit pattern
    const ePattern = new RegExp(
      `(const|let|var)\\s*${reName}\\s*=\\s*`, 
      'g'
    )
    
    // Implicit pattern
    const iPattern = new RegExp(
      `[\\s;]${reName}\\s*=\\s*`,
      'g'
    )
    
    let match
    
    let patterns = [ePattern, iPattern]
    
    for (const pattern of patterns) {
      while ((match = pattern.exec(this.content)) != null) {
        let isGlobal = false
        
        if (match[1]) {
          isGlobal = BracketBuffer.at(
            this.content, match.index
          ).isEmpty()
        } else {
          isGlobal = ENABLE_IMPLICIT_DEFINITON
          
          if (
            name.includes("module.exports")
          ) {
            isGlobal = true
          }
        }
        
        if (isGlobal) {
          const start = 
            match.index + match[0].length
          
          const end = new BracketBuffer(this.content, start)
            .move()
            .moveUntilLineEnd()
            .moveUntilEmpty()
            .pos
           
          if (this.debug)
            console.log(`${name} gotten`)  
          
          return this.content.substring(start, end)
        }
      }
    }
  }
}
















/**
 * Skuttle around files looking for imports
 **/
const Spider = class {
  constructor (content, path) {
    
    // If none given, dir is home
    if (!path) {
      this.dir = fs.documentsDirectory()
      
      this.path = undefined
    } else {
      this.path = path
      
      this.dir = fs.directory(path)
    }
    
    this.content = content
    
    this.sr = new StringRemover(minify(content))
    
    // Paths depended on
    this.depends = []
    
    // Add default alias
    this.aliases = ['importModule']
    // Add any extra aliases
    this.getImportAliases()
    
    // Find the imports
    this.findImports()
  }
  
  static fromFile (path) {
    if (fs.fileExists(path)) {  
      const content = minify(fs.readString(path))
        
      return new this(content, path)
    } else {
      console.warn(`Spider: Unable to load ${path}`)
    }
  }
  
  findImports() {
    this.aliases.forEach(alias => {
      let pattern = new RegExp(
        `${alias}\\(\\s*@StringRemover_[a-zA-Z]+\\[(\\d+)\\]\\s*\\)`,  
        'g'
      )
      
      const matches = this.sr  
        .getContent().match(pattern)
      
      if (!matches) return
      
      for (let match of matches) {
        const index = Number(match.replace(pattern, "$1"))
  
        const string = this.sr.strings[index]
        
        let fileName = string
        
        // Remove surrounding quotes
        fileName = fileName.substring(1, fileName.length - 1)
        
        if (fs.extension(fileName)==fileName)
          fileName += ".js"
        
        fileName = `${this.dir}/${fileName}`
        
        if (!fs.fileExists(fileName)) {
          console.warn(`Spider: Unable to load ${fileName}`)  
          
          continue
        }
        
        this.depends.push(fileName)
        
        this.content = this.content
          .replaceAll(
            `${alias}(${string})`,
            `importModule("${fileName}")`
          )
      }
    })
  }
  
  // TODO: wouldn't detect an alias of an alias
  getImportAliases() {
    const pattern = /(\S*)\s*=\s*importModule[^\(]/g
    
	const matches = this.content.match(pattern)
    
    if (!matches) return

	for (let match of matches) {
  	  const name =match.replace(pattern, '$1')
  
      this.aliases.push(name)
	}
  }
}

















/** 
 * The all important unit tests
 **/
importModule("shouldDemo")(module, () => {
  /*const Test = importModule("Test")
  
  const Benchmark = importModule("Benchmark")
  
  const stacktrace = importModule("stacktrace").stacktrace
  
  const scopedEval = (code) => {
    return eval(`(() => {${code}})()`)
  }
  
  const testModule = (filename,debug=false)=>{
    return Test.test(stacktrace(() => {  
      const path = buildPath("~/" + filename)
      
      const content = new Module(  
        fs.readString(path), debug
      ).exported
      
      try {
        scopedEval(content)
      } catch (e) {
        console.log(content)
        
        const a = new Alert()
        a.message = `${filename} module generation failed. Copy to pasteboard?`

        a.addAction("No")
        a.addAction("Yes")
        
        a.present().then(index => {
          if (index == 1) {
            console.log(`copied ${filename}`)
            
            Pasteboard.copy(content)
          }
        })
        
        throw e
      }
    }), `Module.getExports - ${filename}`)
  }
  
  Test.all(
    Test.assert(
      new Spider(`
const alias = importModule;

const HardenedFS = alias("HardenedFS")
const Test = alias("Test")
`).depends.length, 2, 'Spider'),
    Test.assert(
      buildPath('/test/../dir/'), 
      '/dir/', 'buildPath - join'
   	),
    Test.assert(
      buildPath('~'),
      fs.documentsDirectory(), 
      'buildPath - home'
    ),
    Test.assert(
      Module.findDepends("this.test;").length,
      0, "Module.findDepends"),
    testModule("HardenedFS.js"),
    testModule("Test.js"),
    testModule("shouldDemo.js"),
    testModule("BracketBuffer.js"),
    testModule("StringRemover.js"),
    
    Test.test(() => {
      scopedEval(new Module(`
const print = console.log

const fn = (msg) => {
  const div = "=".repeat(10)
  
  print(div)
  console.log(msg)
  console.log(div)
}

module.exports = fn

`).exported)
    }, "Module.getExports 2"),
    Test.test(() => {  
      let sm = ScriptMerge.fromFile(
        buildPath(module.filename),
        {
          debug: true,
          minify: true
        }
      )
      
      const bm = new Benchmark("Bootstrapping")
      
      bm.start()
      
      const generated = sm.run()
      
      bm.finish()
      
      Pasteboard.copy(generated)
    }, "Build Self")
  )*/
  
  if (args.fileURLs.length) {
    args.fileURLs.forEach(file => {
      ScriptMerge.gui(file)
    })
  } else {
    ScriptMerge.gui()
  }
})

module.exports = ScriptMerge