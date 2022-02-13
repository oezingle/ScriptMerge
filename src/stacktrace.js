// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
const stacktraceError = (error) => {
  let {stack} = error
    
  // TODO: check it works for async () => {}
  //stack = stack.replace(/asyncFunctionResume[\s\S]*/g, '')
    
  stack = stack.split(/\s*@\s*/g)
    
  stack.splice(-2)
    
  stack = stack.map(fn => {
    return fn ? fn : "(Anonymous)"
  }).reverse()
    
  stack = stack.map(fn => {
    return fn == "_stacktraced" ? null : fn
  }).filter(Boolean)
    
  error.message += "\n" + "  In " + stack.join("\n  In ")
    
  throw error
}

const stacktrace = (fn) => {
  // Allow decorator
  let _stacktraced = (...args) => {
    try {
      return fn(...args)
    } catch (e) {
      stacktraceError(e)
    }
  }
    
  return _stacktraced
}

module.exports = {
  stacktrace,
  stacktraceError
}

importModule("shouldDemo")(module, () => {
  try {  
    const a = () => {
      throw new Error()
    }
    
    const b = () => a()
    
    const c = () => {b()}
    const d = () => (() => c())()
    
    try {
      d()
    } catch (e) {
      stacktraceError(e)
    }
  } catch (e) {
    console.warn(e)
  }
  
  try {
    const a = () => {
      throw new Error()
    }
    
    const b = () => a()
    
    const c = () => {b()}
    const d = () => stacktrace(() => c())()
    
    d()
  } catch (e) {
    console.warn(e)
  }
})