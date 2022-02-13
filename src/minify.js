// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;

const StringRemover = importModule("StringRemover")

const minify = script => {
  script = script
    // Block 1
    // Multiline Comments
    .replace(/\/\*([\s\S]*?)\*\//g, '')
    // Single line comments
    // On newlines
    .replace(/^\s*\/\/[^\n]*/gm, '')
    // Outside of quotes
    //.replace(/([^"'`]*)\/\/[^\n]*/gm, '$1')
    .replace(/\s+\/\/[^\n]*/gm, '')
  
  let sr = new StringRemover(script)
  
  sr.setContent(sr.getContent()
    // Block 2
    // if ()\n result -> if () result
    .replace(/(if|for|while)\s*\((.*)\)\s*/g, '$1($2)')
    .replace(/else\s*/g, 'else ')
    
    // Block 3
    // Prep edge cases that can't have whitespace removed  
    .replace(/(\+\+|--)\n+/gm, "$1;")
    .replace(/(?![a-zA-Z0-9_$])(\/[^\/]*\/[igsmyu]*)\s+([a-zA-Z0-9_$])/g, '$1;$2')
    // remove whitespace around non-letter/numbers
    .replace(/\s*([^a-zA-Z\s$0-9_])/g, '$1')
    
    .replace(/([^a-zA-Z\s$0-9_])\s*([^a-zA-Z\s$0-9_])/g, '$1$2')
    
    // Block 4
    .replace(/([\[\{\(,\?\:])\s+/g, '$1')
    .replace(/([\]\}\)0-9])\s*\n\s*/g, '$1;')
  
    .replace(/\s*([\]\}\)])/g, "$1")
    
    // Block 5
    .replace(/([aA-zZ"'`])\s*\n\s*/g, '$1;')
    
    // Block 6
    // Remove whitespace after non-letters
    //.replace(/[^aA-zZ\s])\s*/g, '$1')
    .replace(/([^a-zA-Z\s])\s*/g, '$1')
  )
  
  script = sr.reinsertStrings()
    
  while(script[0] == '\n')
    script = script.substr(1)
  
  return script
}

importModule("shouldDemo")(module, () => {
  console.log(  
    minify(  
      FileManager.iCloud().readString(  
        module.filename
      )
    )
  )
})

module.exports = minify