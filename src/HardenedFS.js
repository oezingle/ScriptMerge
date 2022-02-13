// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: shield-alt;
/*
// FIXME: doesnt work
const HardenedFS = class {
  constructor(iCloud) {
    const instance = iCloud ?   
      FileManager.iCloud() :
      FileManager.local()
    
    return new Proxy(
      instance, 
      {
        get: (obj, prop) => {
          
          //A list of functions that only   
          //print to the console when a file   
          //doesnt exist, which should instead   
          //be an error
          const notExistsProne = [
            //'readString',
            'readImage'
          ]
          
          if (notExistsProne.includes(prop)) {
            return (filePath) => {
              if (!obj.fileExists(filePath)) {
                throw new Error(`File ${filePath} does not exist`)
              }
              
              return obj[prop](filePath)
            }
          }
          
          return obj[prop]
        }
      }
    )
  }

  static local () {
    return new HardenedFS(false)
  }
}
*/

const extension = importModule("extension")

const HardenedFS = class {
  constructor (iCloud) {
    this.patch()
    
    this.instance = iCloud ?
      FileManager.iCloud() :
      FileManager.local()
  }
  
  _call(method, ...args) {
    return this.instance[method](...args)
  }
  
  _ignore = this._call
  
  _errNotExists(method, filePath) {
    if (!this.instance.fileExists(filePath)) {
      throw new Error(`File ${filePath} does not exist`)
    }
    
    return this._call(method, filePath)
  }
  
  patch() {
    const notExistsProne = [
      "readString",
      "readImage",
      "read"
    ]
    
    const keys = Object.getOwnPropertyNames(  
      FileManager.prototype
    )
    
    for (let key of keys) {
      if (!this[key]) {
        
        const val = FileManager.prototype[key]
        
        if (typeof val != "function") continue
        
        if (notExistsProne.includes(key)) {
          this[key] = (...args) => {
            return this._errNotExists(key, ...args)
          }
        } else {
          this[key] = (...args) => {
            return this._call(key, ...args)
          }
        }
      }
    }
  }
  
  static local () {
    return new HardenedFS(false)
  }
  static iCloud () {
    return new HardenedFS(true)
  }
  
  static extension = extension
  extension = extension
  
  static directory = (path) => {
    return path.replace(/\/(?:.(?!\/))+$/m, '')
  }
  directory = HardenedFS.directory
  
  path (path) {
    return path.replace(
      '~', this.instance.documentsDirectory()
    )
  }
}

//importModule = importModule("tryImport")

importModule("shouldDemo")(module, () => {
  const Test = importModule("Test")
  
  const fm = new HardenedFS(true)
  
  Test.all(
    Test.test(() => {fm.readString("@")}, "readString", true),
    Test.test(() => {fm.readImage("@")}, "readImage", true),
    Test.test(() => {fm.read("@")}, "read", true),  
    Test.assert(fm.directory("/dir/file.ext"), "/dir", "Directory")
  )
})

module.exports = HardenedFS