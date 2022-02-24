// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
/**
 * FILE: configureObject.js
 * 
 * function that lets a user modify values in
 * an object 
 * 
 * Supported datatypes:
 * - Boolean
 * - String
 * - Number
 * - Keyed Object
 * 
 * @author oezingle (oezingle@gmail.com)
 **/

const AlertFactory = importModule("AlertFactory")

const getHandle = (val, handle) => {
  let type = typeof val
  
  if (type == "object" && val instanceof Array) type = "array"
  
  const getter = handle?.get ?? ConfigurationPresets._default[type]?.get ?? ConfigurationPresets._default.any.get
  const setter = handle?.set ??
ConfigurationPresets._default[type]?.set ??
ConfigurationPresets._default.any.set
  
  return {
    get: getter, set: setter
  }
}

const symbolImage = name => 
  SFSymbol.named(name).image

const ConfigurationPresets = {
  _default: {  
    number: {
      set: (obj, prop) => {
        const val = String(obj[prop])
        
        return new AlertFactory(
          prop,
          "Set Numerical Value"
        )
          .addTextField("Input Value", val)
          .addAction("Done", (alert) => {
            obj[prop] = Number(alert.textFieldValue(0))
          })
          .addCancelAction("Cancel")
          .present()
      }
    },
    boolean: {
      get: (obj, prop, row) => {
        const val = obj[prop]
        
        const name = val ?   
          "checkmark.circle.fill" : "circle"
  
        const cell = UITableCell
          .image(symbolImage(name))
        
        cell.rightAligned()
        
        row.addCell(cell)
        
        return row
      },
      set: (obj, prop) => {
        obj[prop] = !obj[prop]
      }
    },
    string: {
      set: (obj, prop) => {
        // TODO: is there some sort of tall
        //text input field option?
        
        const val = String(obj[prop])
        
        return new AlertFactory(
          prop,
          "Set String Value"
        )
          .addTextField("Input Value", val)
          .addAction("Done", (alert) => {
            obj[prop] = alert.textFieldValue(0)
          })
          .addCancelAction("Cancel")
          .present()
      }
    },
    object: {
      get: (obj, prop, row) => {
        const val = obj[prop]
        
        let preview = `{...}`
        
        const cell = UITableCell.text(preview)
  
        cell.rightAligned()
        
        row.addCell(cell)
        
        return row
      },
      set: (obj, prop, handler) => configureObject(obj[prop], handler[prop])
    },
    array: {
      // TODO: this (too lazy)
    },
    any: {
      get: (obj, prop, row) => {
        const val = obj[prop]
        
        let preview = String(val)
        
        if (preview.length > 32) {
          preview = "..."
        }
        
        const cell = UITableCell.text(preview)
  
        cell.rightAligned()
        
        row.addCell(cell)
        
        return row
      },
      set: () => {}
    }
  },
  hidden: {
    get: () => {}
  }
}

const configureObject = (obj, handler={}) => {
  let keys = Object.getOwnPropertyNames(obj)
  
  const table = new UITable()
  
  table.showSeparators = true 
  
  const populateTable = () => {
    table.removeAllRows()
    
    for (let key of keys) {
      const val = obj[key]
      
      let handle = getHandle(val, handler[key])
      
      let row = new UITableRow()
      row.addText(key, typeof val)
      
      // Let handler overwrite
      row = handle.get(obj, key, row)
      
      if (row) {  
        row.dismissOnSelect = false
        
        row.onSelect = async () => {
          await handle.set(obj, key, handler)
          
          populateTable()
        }
        
        table.addRow(row)
      }
    }
    
    table.reload()
  }
  
  populateTable()
  
  return table.present()
}

importModule("shouldDemo")(module, () => {
  let obj = {
    debug: true,
    count: 1,
    name: "String",
    array: [0, 1, 2],
    obj: {test: true}
  }
  
  let handler = {
    obj: { test: ConfigurationPresets.hidden }
  }
  
  configureObject(obj, handler)
})

module.exports = {configureObject, ConfigurationPresets}