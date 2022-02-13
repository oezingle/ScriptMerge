// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: project-diagram;








module.exports = (module, callback) => {
  const scriptName = Script.name()
  
  const fName = module.filename
    .replace(/.*\//, '')
    .replace(".js", '')
    
  if (scriptName === fName) {
    if (callback) {
      callback()
    } else {
      return true
    }
  }
  
  return false
}