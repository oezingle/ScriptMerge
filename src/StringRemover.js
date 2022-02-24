// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
/**
 * FILE: StringRemover.js
 * 
 * Temporarily remove JavaScript string 
 * literals from a string to lessen headaches
 * when interpreting code
 * 
 * @author oezingle (oezingle@gmail.com)
 **/

const BracketBuffer = importModule("BracketBuffer")
  
const StringRemover = class {
  constructor (content) {
    this.content = content
    
    this.strings = []
      
    this.removeStrings()
  }
  
  getContent() {
    return this.content
  }
  
  setContent (content) {
    this.content = content
  }
  
  prepend(newlet) {
    this.setContent(newlet + this.getContent())
  
    this.removeStrings()
  }
  
  append(newlet) {
    this.setContent(this.getContent() + newlet)
  
    this.removeStrings()
  }
  concat = this.append
  
  removeStrings() {
    const brackets = "{}()[]".split("")
    
    let bb = new BracketBuffer(this.content)
    
    let lastBuff = ""
    
    let start = -1
    
    let replacements = []
    
    this.strings.forEach(string => {
      replacements.push({slice: null, replacmeent: ""})
    })
    
    while (bb.hasNext()) {
      bb.move()
      
      // Char has caused a buffer change
      if (
        lastBuff.length != bb.buff.length
      ) {
        let lastBuffered = bb.buff.slice(-1)
        
        if (lastBuffered && !brackets.includes(lastBuffered)){
          // Is a quote or regex
          
          if (start === -1) {
            // Is a new String
            start = bb.pos - 1
          }
        } else if (
          lastBuff.length > bb.buff.length &&
          start !== -1 &&
          !brackets.includes(bb.curr)
        ) {
          // End of string 
          let slice = this.content  
            .substring(start, bb.pos)
          
          let replacement = undefined
          
          switch (slice[0]) {
            case "/": {
              let pos = bb.pos
              
              let flags = "igsmyu".split("")
              
              while (flags.includes(this.content[pos])) {
                pos ++
              }
              
              slice = this.content
                .substring(start, pos)
              
              replacement = `@StringRemover_Regex[${replacements.length}]`  
              
              break
            }
            case "`": {
              // Re-insert referenced vars
              const formatVar = /\${([^}]*)}/g
        
              let vars = []
              
              slice
                .match(formatVar)?.forEach(m => {
                vars
                  .push(m.replace(
                    formatVar, 
                    "$1"
                  ))
                })
      
          
              replacement =               
                "@StringRemover_Format[" +
                replacements.length +
                "]" + " " + vars.join(" ") + 
                " " + "@StringRemover_End"
                
              break
            }
            default: {
              replacement = `@StringRemover_Simple[${replacements.length}]`  
              break
            }
          }
          
          if (replacement) {  
            replacements.push({
              slice,
              replacement
            })
          }
          
          // Reset Start
          start = -1
        }
      }
      
      lastBuff = bb.buff
    }
    
    replacements.forEach(({slice, replacement}) => {
      if (!slice || !replacement) return
  
      this.content = this.content
        .replace(slice, replacement)
        
      this.strings.push(slice)
    })
  }
  
  reinsertStrings() {
    // TODO: Breaks when merged
    
    let newContent = this.content
    
    const r = /@StringRemover_([a-zA-Z]+)\[(\d+)\]/g
  
    for (let i = 0; i < 10; i ++) {  
      let match
      while ((match=r.exec(newContent))!=null) {
        switch (match[1]) {
          case "Format": {
            const endS = '@StringRemover_End'
              
            const end = newContent.indexOf(endS, match.index) + endS.length
              
            const slice = newContent  
              .substring(match.index, end)
                
            const index = Number(match[2])
              
            newContent = newContent
              .replace(
                slice,
                () => this.strings[index]
              )
              
            break
          }
            
          default: {
            const index = Number(match[2])
            
            // Functionizing disallows population of $1, $2, etc
            newContent = newContent
              .replace(
                match[0],
                () => this.strings[index]
              )
              
            break
          }
        }
      }
    }
    
    return newContent
  }
}

module.exports = StringRemover

importModule("shouldDemo")(module, () => {  
  /*console.log(new StringRemover(`
"@"

/test/g

".".match(/test/)

let object = "World"
  
console.log(\`hello \${object}\`)
  `).reinsertStrings())*/
  
  let sr = new StringRemover(`
const escapeForRegex = (string) => {
  return string.replace(
    /[.*+?^\${}()|[\\]\\\\]/g, 
    '\\\\$&'
  )
}
  `)
  console.log(sr.reinsertStrings())
})