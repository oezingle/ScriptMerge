// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;







const StringRemover = importModule("StringRemover")

// TODO: has some issues with division
// (var1 / var2 )

const minify = script => {
  // Helps reduce this file's final size
  const multiReplace =(content, patterns) => {
    let out = content
    
    patterns.map(([pattern,replacement]) => {
      out = out
        .replace(pattern, replacement)
    })
    
    return out
  }
  
  script = multiReplace(script, [
    // Block 1
    // Multiline Comments
    [/\/\*([\s\S]*?)\*\//g, ''],
    // Single line comments
    // On newlines
    [/^\s*\/\/[^\n]*/gm, ''],
    // Outside of quotes
    [/\s+\/\/[^\n]*/gm, '']
  ])
  
  let sr = new StringRemover(script)
  
  sr.setContent(multiReplace(sr.getContent(),[
    // Block 2
    // if ()\n result -> if () result
    [/(if|for|while)\s*\((.*)\)\s*/g, '$1($2)'],
    [/else\s*/g, 'else '],
    
    // Block 3
    // Prep edge cases that can't have whitespace removed  
    [/(\+\+|--)\n+/gm, "$1;"],
    [/(?![a-zA-Z0-9_$])(\/[^\/]*\/[igsmyu]*)\s+([a-zA-Z0-9_$])/g, '$1;$2'],
    // remove whitespace around non-letter/numbers
    [/\s*([^a-zA-Z\s$0-9_])/g, '$1'],
    
    [/([^a-zA-Z\s$0-9_])\s*([^a-zA-Z\s$0-9_])/g, '$1$2'],
    
    // Block 4
    [/([\[\{\(,\?\:])\s+/g, '$1'],
    [/([\]\}\)0-9])\s*\n\s*/g, '$1;'],
  
    [/\s*([\]\}\)])/g, "$1"],
    
    // Block 5
    [/([aA-zZ"'`])\s*\n\s*/g, '$1;'],
    
    // Block 6
    // Remove whitespace after non-letters
    //.replace(/[^aA-zZ\s])\s*/g, '$1')
    [/([^a-zA-Z\s])\s*/g, '$1']
  ]))
  
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