// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: microscope;
/**
 * Wrap a method in try catch blocks
 * 
 * Can include context
 **/
const tryMethodFactory = (modName, method, context) => {
  return (...args) => {
    try {
      //method(...args)
      
      // provide a context
      return method.call(context, ...args)
    } catch (e) {
      //console.error(`error in module ${modName}: ${method.name ? method.name : "(Anonymous)"}`)
  
      const methodName = method.name ?? "(Anonymous)"

      //throw e
      
      throw new Error(`in ${modName} -> ${methodName}: ${e.toString()}`)
    }
  }
}

/**
 * Wrap a class in try catch blocks
 **/
const tryClassFactory = (modName, Class) => {
  const proxied = class {
    constructor(...args) {
      const instance = new Class(...args)
      
      return new Proxy(
        instance,
        {
          get: (obj, prop) => {
            const val = obj[prop]
            
            if (typeof val != "function") {
              return val
            } else {
              // Call tryMethodFactory with 
              //context
              return tryMethodFactory(
                modName, 
                val,
                instance
              )
            }
          }
        }
      )
    }
  }
  
  // Toss in static methods
  let statics = Object.getOwnPropertyNames(Class)
  
  for (let key of statics) {
    const current = proxied[key]
    
    if (current) continue
    
    const old = Class[key]
    
    if (typeof old != "function") continue
    
    proxied[key] = tryMethodFactory(modName, old, Class)
  }
  
  return proxied
}

/**
 * Wrap a given variable in try catch blocks
**/
const tryify = (original, modName) => {
  switch (typeof original) {
    case "object": {
      newThing = {}
        
      for (const key in original) {
        const originalThing = original[key]
        
        newThing[key] = tryify(
          originalThing, 
          modName
        )
      }
      
      return newThing
    }
    
    case "function": {
      if (Boolean(original.prototype)) {
        // Prototype exists with classes
        return tryClassFactory(
          modName, 
          original
        )
      } else {
        // Not a class
        return tryMethodFactory(
          modName,
          original
        )
      }
    }
    
    default: {
      return original
    }
  }
}

const importMsg = (modName) => {
  console.log(`Imported ${modName}`)
}

const tryImport = (modName) => {
  let original
  
  try {
    original = importModule(modName)
  } catch (e) {
    console.error(e)
    
    throw new Error(`Unable to import ${modName}`)
  }
  
  /*if (!module) {
    throw new Error(`No Module exports at ${modName}`)
  }*/
  
  const wrapped = tryify(original, modName)
  
  importMsg(modName)
  
  return wrapped
}

module.exports = tryMethodFactory(    
  tryImport.name,
  tryImport
)

tryImport("shouldDemo")(module, () => {
  QuickLook.present(`
Scriptable is great, but sometimes it's hard to identify which module an error comes from when writing code. tryImport helps by wrapping any imported modules in try...catch blocks

Usage

importModule = importModule("tryImport")
const <module> = importModule(<module>)

These patched imports will tell you the origin of errors
`, false)
  
  const Test = tryImport("Test")
  
  Test.all(
    Test.test(() => {
      const HasStatic = class {
        static method() {
          return new this()
        }
      }
      
      tryClassFactory("@", HasStatic).method()
    }, "StaticClass"),
    
    Test.test(() => {
      const Class = class {
        constructor () {}
        
        test() {}
      }
      
      const Patched = tryClassFactory("@", Class)    
      const inst = new Patched()
      inst.test()
    }, "InstanceClass"),
    
    Test.test(tryMethodFactory("@", () => {}), "tryMethod")
  )
})