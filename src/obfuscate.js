// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// TODO: the biggest issue is gonna be scope managment - two variables of the same name can destroy the whole project
// TODO: break out BracketBuffer to a new file?

// TODO: fn args

const StringRemover = importModule("StringRemover")

const forRegex = (pattern, content, fn) => {
  let match
  
  while ((match = pattern.exec(content)) != null) {
    fn(match)
  }
}

const obfuscate = (content) => {
  const sr = new StringRemover(content)
  
  content = sr.getContent()
  
  // TODO: descend layer-by-layer into scope
  const pattern = /(const|let|var)\s+(\S*)\s*=/g
  
  forRegex(pattern, content, match => {
    let name = match[2]
    
    content = content.replaceAll(name, genName())
  })
  
  sr.setContent(content)
  
  return sr.reinsertStrings()
}

let nameIndex = 0

const genName = () => {
  const encode = (int) => {
    let letters = ' '.repeat(26)
    .split('').map((e,index) => {  
        return (index + 10).toString(36)
      })
      
    letters = letters
      .concat(letters.map(e => {  
        return e.toUpperCase()
      }))
    
    if (int === 0) return letters[int]
    
    let res = ""
    while (int > 0) {
      res = letters[int % letters.length] + res;  
      int = Math.floor(int / letters.length)
    }
    
    return res
  }
  
  return encode(nameIndex++)
}

importModule("shouldDemo")(module, () => {
  const Test = importModule("Test")
  
  const fs = FileManager.iCloud()
  
  Test.all(
    Test.test(() => {
      let expecteds = ' '.repeat(26)  
        .split('').map((e,index) => {  
          return (index + 10).toString(36)
        })
        
      expecteds.forEach(expected => {
        if (expected != genName())
          throw new Error()
      })
      
      nameIndex = 0
    }, "genName")
  ),
  Test.test(() => {
    Pasteboard.copy(obfuscate(
      fs.readString(fs.documentsDirectory() + "/HardenedFS.js")
    ))
  })
})

module.exports = obfuscate