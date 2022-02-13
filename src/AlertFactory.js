// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
const ObjectiveCProxy = importModule("ObjectiveCProxy")


const AlertFactory = class extends ObjectiveCProxy {
  constructor (title = "", message = "") {
    const alert = new Alert()
    
    alert.title = title
    alert.message = message
    
    let index = 0
    let indices = {}
    
    let handler = {
      get: (obj, prop) => {
        if (prop == "present") {  
          return (fullscreen) => {
            return obj.present(fullscreen)  
              .then(index => {
                return indices[index](obj)
              })
          }
        } else if(prop.match(/add\S*Action/)){
          return (title, fn) => {
            if (!fn) fn = () => {}
            
            obj[prop](title)
            
            switch (prop) {
              case "addCancelAction": {
                indices[-1] = fn
                
                break
              }
              default: {
                indices[index++] = fn
                
                break
              }
            }
            
            return this
          }
        }
        
        // By default, conform to factory patt
        if (obj[prop] instanceof Function) {  
          return (...args) => {
            obj[prop](...args)
            
            return this
          }
        } else {
          return obj[prop]
        }
      }
    }
    
    super(alert, handler)
  }
}

module.exports = AlertFactory

importModule("shouldDemo")(module, () => {  
  const alert = new AlertFactory("AlertFactory Demo", "Click a button below to perform its callback")  
    .addAction(
      "Test", 
      () => console.log("Im an integral")
    )  
    .addCancelAction(
      "Cancel", 
      () => console.log("Im a derivative")
    )  
    .addDestructiveAction(
      "Destroy", 
      () => console.log("Im a limit")
    )
  
  alert.present().then(() => {
    alert.present()
  })
})
