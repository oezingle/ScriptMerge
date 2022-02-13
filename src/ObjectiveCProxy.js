// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: magic;
const ObjectiveCProxy = class {
  constructor (target, handler) {
    this.target = target
    this.handler = handler
    
    this.patch()
  }
  
  _call(method, ...args) {
    return this.target[method](...args)
  }
  
  patch() {
    const prototype = this.target.constructor.prototype
  
    //console.log(this.target.constructor.prototype)
    
    const keys = Object.getOwnPropertyNames(  
      prototype
    )
    
    for (let key of keys) {
      if (!this[key]) {
        
        const val = this.target[key]
        
        if (typeof val != "function") continue
        
        if (this.handler.get) {
          this[key] = (...args) => {
            let fn =     this.handler.get(this.target, key)
            
            if (fn == this.target[key]) {
              // Hackiest shit ever 
              return this._call(key, ...args)
            } else {
              return fn(...args)
            }
          }
        } else {
          this[key] = (...args) => {
            return this._call(key, ...args)
          }
        }
      }
    }
  }
}

module.exports = ObjectiveCProxy

importModule("shouldDemo")(module, () => {
  const proxied = new ObjectiveCProxy(
    new Alert(),
    {
      get: (obj, prop) => {
        console.log(prop)
        
        let val = obj[prop]
        
        return val
      }
    }
  )
  
  proxied.present()
})