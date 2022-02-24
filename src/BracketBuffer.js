// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: gray; icon-glyph: magic;
/**
 * FILE: BracketBuffer.js
 *
 * Use brackets, string literals, and regex to 
 * determine scope at a basic level. Does not
 * play well witn comments
 * 
 * @author oezingle (oezingle@gmail.com)
 **/

/**
 * BEWARE: edge case w/ code formatted like:
 * const fn = () =>
 * {
 *   ...
 * }
 * because of BracketBuffer.moveUntilLineEnd()
 * Minify your code if it looks like this!
 **/

// how on earth is regex detected

const BracketBuffer = class {
  constructor(content, pos=0, debug=false) {
    this.content = content
    
    this.pos = pos
    
    this.buff = ""
    
    this.curr = ''
    
    this.debug = debug
  }
  
  at (pos) {
    return this.from(0, pos)
  }
  
  from (start, end) {
    if (!start) start = 0
    
    if (!end) end = this.content.length - 1
    
    this.pos = start
    
    while (this.pos <= end) {
      this.move()
    }
    
    return this
  }
  
  /**
   * Count backslashes to determine if a 
   * character in quotes is cancelled or not
   *
   * assumes backslashes start before this.pos
   **/
  charIsCancelled () {
    const BACKSLASH = '\\'
    
    let backslashCount = 0
    let minusIndex = 1
    
    let prev
    
    prev = this.content[this.pos - minusIndex]
    
    while(prev == BACKSLASH) {
      backslashCount ++
      minusIndex ++
      
      prev = this.content[this.pos - minusIndex]
    }
    
    return backslashCount % 2 == 1
  }
  
  move() {
    this.oobCheck()
    
    const brackets = "{}[]()"
    const quotes = "'\"`"
    const regex = "/"
    
    this.curr = this.content[this.pos]
    const last = this.buff.substr(-1) || null
    
    // this is a bracket. simple
    if (brackets.includes(this.curr)) {
      if (
        quotes.includes(last) ||
        regex.includes(last)
      ) {} else {
        this.buff += this.curr
      }
    // quotes can contain arbitrary expressions in them  
    // TODO: doesnt consider backslashes
    } else if (quotes.includes(this.curr)) {
      if (!regex.includes(last)) {
        if (quotes.includes(last)) {
          if (last == this.curr) {
            if (!this.charIsCancelled()) {
              this.buff += this.curr
            }
          }
        } else {
          this.buff += this.curr
        }
      }
    } else if (regex.includes(this.curr)){
      // Check that there's another / within a 
      // newline
      let slashBeforeLineEnd = (() => {
        let afterSlash = this.content  
          .substr(this.pos)
          
        let newline = afterSlash.indexOf("\n")
        if (newline === -1) 
          newline = Number.MAX_SAFE_INTEGER
          
        let slash = afterSlash.indexOf("/")
        if (slash === -1) return false
      
        return slash < newline
      })()
      
      // check that the previous non-whitespace char wasn't alphanumeric  
      let precedingIsAlphaNumeric = (() => {
        let index = this.pos
        
        let curr = this.content[index]
        
        while (index > 0) {
          index -= 1
          
          curr = this.content[index]
          
          if (!curr.match(/\s/)) {
            return Boolean(curr.match(/[a-zA-Z0-9_$]/))
          }
        }
        
        return false
      })()
      
      if (!quotes.includes(last)) {
        if (regex.includes(last)) {
          if (last == this.curr) {
            if (!this.charIsCancelled()) {
              this.buff += this.curr
            }
          }
        } else {
          if (slashBeforeLineEnd 
            && (!precedingIsAlphaNumeric)) {
            this.buff += this.curr
          }
        }
      }
    }
    
    const last2 = this.buff.substr(-2)
    
    const pairs = [
      "[]", "{}", "()"
    ].concat(
      quotes
        .split('')
        .concat(regex.split(''))
        .map(char => {
          return char.repeat(2)
        })
    )
   
    if (pairs.includes(last2)) {
      this.buff = this.buff.substr(
        0, 
        this.buff.length - 2
      )
    }
    
    this.pos ++
    
    return this
  }
  
  moveUntilEmpty() {
    while (!this.isEmpty()) {
      this.move()
    }
    
    return this
  }
  
  moveUntilLineEnd() {
    while (![";", "\n"].includes(this.curr))
    {
      this.move()
    }
    
    return this
  }
  
  hasNext() {
    return this.pos <= this.content.length
  }
  
  oobCheck() {
    if (!this.hasNext()) {
      if (this.debug) {  
        console.log("BBOOB: content ========")
        console.warn(this.content)
        console.log("BBOOB: buffer =========")
        console.warn(this.buff)
      }
      
      throw new Error("BracketBuffer Out of Bounds Error")
    }
  }
  
  isEmpty() {
    return this.buff.length === 0
  }
  
  static from (content, start, end) {
    return new this(content).from(start, end)
  }
  
  static at (content, pos) {
    return this.from(content, 0, pos)
  }
}

module.exports = BracketBuffer

importModule("shouldDemo")(module, () => {
  const Test = importModule("Test")
  
  const emptyBB = (content, name) => {
    return Test.assert(
      BracketBuffer.from(content).isEmpty(),
      true, name
    )
  }
  
  Test.all(
    emptyBB("'{}'", "Bracket in quotes"),
    emptyBB("[{('`')}]", "Brackets"),
    emptyBB('"\'\\"`"', "Many quotes"),
    emptyBB("/('/", "Regex"),
    emptyBB("\"don't :)\"", 
      "Quotes - Subquotes"),
    emptyBB("(/\\//)", "Quotes - Backslash"),
    emptyBB("'\\\\'", 
      "Quotes - Double Backslash"),
    emptyBB("\"/\"", "Quotes - Slash"),
    emptyBB("({ })", "innerBracket"),
    emptyBB("\s", "Arbitrary Backslash"),
    emptyBB("\n", "Arbitrary Backslash 2"),
    Test.test(() => {
      const bb = new BracketBuffer("() => {}}").move().moveUntilEmpty()
    }, "moveUntilEmpty"),
    Test.test(() => {
      new BracketBuffer("{ ", 0, true).move().moveUntilEmpty()
    }, "BBOOB Error", true)
  )
})