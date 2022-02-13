// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
// TODO: module vars should sometimes not be declared as let

// TODO: Spider -> Module -> Dependencies to limit including dead modules

// TODO: add 'unmeddled' versions of globalThis object? - eg when user replaces importModule, breaking tryImport

// TODO: SpiderList class or something to hold the list of spiders and operate on it

//importModule = importModule("tryImport")

const stacktrace = importModule("stacktrace").stacktrace

const HardenedFS = importModule("HardenedFS")

const BracketBuffer = importModule("BracketBuffer")

const StringRemover = importModule("StringRemover")

const minify = importModule("minify")

//const obfuscate = importModule("obfuscate")

const escapeForRegex = importModule("escapeForRegex")

const uuidGen = importModule("uuidGen")

const AlertFactory = importModule("AlertFactory")

const {configureObject, ConfigurationPresets} = importModule("configureObject")

const fs = HardenedFS.iCloud()

const buildPath = (path) => {
  return path
    .replace(/\/[^\/]*\/\.\./g, '')
    .replace(/^~/m, fs.documentsDirectory())
}






/**
 * Main class
 *  - fromFile
 *  - gui
 **/
const ScriptMerge = class {
  static defaultSettings = {
    debug: false,
    minify: false,
    //obfuscate: false,
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
    
    if (this.settings.debug) {
      console.log("[ScriptMerge] Debugger Enabled")
    }
    
    this.settings.plugins.forEach(plugin => {
      this.addToToolChain(
        plugin.step, 
        plugin.function
      )
      
      if (this.settings.debug)
        console.log(`[ScriptMerge] Added Plugin ${plugin.name ?? "(unknown)"}`)
    })
  }
  
  run_crawl() {
    // Find import calls
    this.runtime.spider = new Spider(this.content)
    
    if (this.settings.debug)
      console.log("[ScriptMerge] Spider Crawling Finished")
  }
  
  /**
   * Find a spider by its path
   **/
  run_findSpider = (path) => {
    const spider = this.runtime.spider
    
    return spider.modules.find(elem => elem.path == path)
    }
  
  run_popularity_contest() {
    const spider = this.runtime.spider
    
    const popularity = {}
    
    /**
     * Count dependencies
     **/
    const popularityContest = (spider, depth = 1) => {
      if (spider.path) {
        if (popularity[spider.path]) {
          popularity[spider.path] += depth
        } else {
          popularity[spider.path] = depth
        }
        if (popularity[spider.path] > 25)
          return
      }
      
      spider.depends.forEach(depend => {
        const dependSpider = this.run_findSpider(depend)
  
        if (dependSpider)
          popularityContest(dependSpider, depth + 1)
      })
    }
    
    popularityContest(spider)
    
    let rankedPopularity = Object  
      .entries(popularity)
      .sort((a,b) => b[1] - a[1])
      .map(n => {
        if (this.settings.debug)
          console.log(`[ScriptMerge] ${n[0]} has popularity ${n[1]}`)
          
        return n[0]
      })
      
    this.runtime.rankedPopularity = rankedPopularity
  }
  
  run_merge_modules() {
    this.runtime.importModuleMap = {}
    this.runtime.output = ""
    
    this.runtime.rankedPopularity.forEach(path => {
      const spider = this.run_findSpider(path)
      
      if (this.settings.debug) {
        console.log(`[ScriptMerge] Merging Module: ${spider.path  
  .replace(fs.documentsDirectory(), '')}`)  
       }
        
      // grab, minify, rename
      const mod = new Module(spider.content,   
        this.settings.debug)
        
      this.runtime.output += ";" + mod.exported
      
      if (this.settings.debug)
        this.runtime.output += "\n\n"
        
      this.runtime.importModuleMap[mod.exportName] = spider.path
    })
  }
  
  run_replace_import_calls() {
    // replace full-path import calls with the 
    //generated module name
    Object
      .entries(this.runtime.importModuleMap)
      .forEach(    
      ([modname, path]) => {
        this.runtime.output = this.runtime.output.replaceAll(
          `importModule("${path}")`,
          modname
        )
      })
  }
  
  dependencyGraph() {
    const truncatePath = (spider) => {
      return spider.path?.replace(spider.dir+"/", "") ?? "[Parent Script]"
    }
    
    const getDepends = (spider, depth=0) => {
      const pad = "  ".repeat(depth)
      
      console.log(pad + truncatePath(spider))
      
      spider.depends.forEach(path => {
        const sub = this.run_findSpider(path)
        getDepends(sub, depth + 1)
      })
    }
    
    getDepends(this.runtime.spider)
  }
  
  run () {
    
    // Find import calls
    this.run_crawl()
    
    // See which imports come first
    this.run_popularity_contest()
    
    this.run_merge_modules()
    
    let script = this.runtime.spider.content
    
    while(script.substr(0, 2) == "//") {
      script = script.substring(
        script.indexOf("\n")
      )
    }
    
    this.runtime.output += script
    
    this.run_replace_import_calls()
    
    //this.dependencyGraph()
    
    if (this.settings.minify)
      this.runtime.output = minify(this.runtime.output)
  
    /*if (this.settings.obfuscate)
      this.runtime.output = obfuscate(this.runtime.output)*/
    
    return this.runtime.output
  }
  
  static fromFile(path, settings) {
    const content = fs.readString(path)
    
    return new this(content, settings)
  }
  
  static ToolChainSteps = {
    READ_FILE: "readFile"
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
            `).then(() => {}, cancel)
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
    const r = /(?:(?:let|const|var)\s*([a-zA-Z0-9_$])|module\.exports)\s*=\s*{/g
    
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
        
        slice = slice.replace(/([^:a-zA-Z])\s*([a-zA-Z]+)([,}])/g, '$1$2: $2$3')
          
        this.content = this.content
          .replace(original, slice)
      } catch (e) {console.warn(e)}
    }
  }
  
  /**
   * Give up and get all global definitons
   **/
  /*static getGlobals(content) {
    
  }*/
  
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
      .replace(/[0-9]/g)
    
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
  constructor (content, path,paths,modules) {
    this.paths = paths
    
    if (this.paths==null) this.paths = []
    
    this.modules = modules
    
    if (this.modules==null) this.modules = []
    
    // If none given, dir is home
    if (!path) {
      this.dir = fs.documentsDirectory()
      
      this.path = undefined
    } else {
      this.path = path
      
      this.dir = fs.directory(path)
    }
    
    this.content = content
    
    this.minContent = minify(content)
    
    // Unique Children
    this.children = []
    // Paths depended on
    this.depends = []
    
    // Add default alias
    this.aliases = ['importModule']
    // Add any extra aliases
    this.getImportAliases()
    
    // Find the imports
    this.findImports()
  }
  
  static fromFile (path, paths, modules) {
    if (fs.fileExists(path)) {  
      if (paths) {
        if (paths.includes(path))
          return modules.find(elem => elem.path == path)
        
        paths.push(path)
      }
      
      const content = minify(fs.readString(path))
        
      let temp = new this(content, path, paths, modules)
      
      if (modules)
        modules.push(temp)
      
      return temp
    } else {
      console.warn(`Spider: Unable to load ${path}`)
    }
  }
  
  findImports() {
    this.aliases.forEach(alias => {
      let pattern = new RegExp(
        `${alias}\\(\\s*['"\`]([^'"\`]+)['"\`]\\s*\\)`,
        'g'
      )
      
      const matches = this.minContent.match(
        pattern
      )
      
      if (!matches) return
      
      for (let match of matches) {
        let fileName = match.replace(
          pattern, '$1'
        )
        
        if (fs.extension(fileName) == fileName) {
          fileName += ".js"
        }
        
        fileName = `${this.dir}/${fileName}`
        
        if (!fs.fileExists(fileName)) {
          console.warn(`Spider: Unable to load ${fileName}`)  
          continue
        }
        
        this.content = this.content
          .replace(
            match, 
            `importModule("${fileName}")`
          )
        
        // Add spider to module list
        if (Spider.fromFile(
          fileName,
          this.paths,
          this.modules
        )) {
          // fromfile returns a module or null
          this.depends.push(fileName)
        }
      }
    })
  }
  
  getImportAliases() {
    const pattern = /(\S*)\s*=\s*importModule[^\(]/g
    
	const matches = this.content.match(  
      pattern
    )
    
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
`).modules.length, 4, 'Spider'),
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
      
      const generated = sm.run()
      
      Pasteboard.copy(generated)
    }, "Build Self")
  )*/
  
  ScriptMerge.gui()
})

// Build self gui?

module.exports = ScriptMerge