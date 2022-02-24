// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: vial;
/**
 * A stupid simple testing framework for
 * scriptable users by oezingle
 **/

const Test = class {
  /**
   * Test instances don't really exist.
   * 
   * new Test(...) returns {success, name}
   **/
  constructor (fn, name, wantsError) {
    const success = () => {
      try {
        fn()
        
        if (wantsError) return false
      } catch (e) {
        if (!wantsError) {
          console.error(`On ${e.line}:${e.column}: ${e}`)
          
          return false
        }
      }
      
      return true
    }
    
    return {name: name, success: success()}
  }
  
  /**
   * Return a new test. the new keyword is 
   * gross
   **/
  static test (...args) {
    return new Test(...args)
  }
  
  static assertError(val1, val2, not) {
    return new Error(`AssertError: ${val1} (expected ${not? "not " : ""}${val2})`)
  }
  
  /**
   * Assert that two values are the same
   **/ 
  static assert(val1, val2, name) {
    return new Test(() => {
      if (val1 != val2) {
        throw Test.assertError(val1, val2)
      }
    }, name)
  }
  
  /**
   * Assert that two values are not the same
   **/
  static assertNot(val1, val2, name) {
    return new Test(() => {
      if (val1 == val2) {
        throw Test.assertError(val1, val2, true)
      }
    }, name)
  }
  
  /** 
   * Assert that a value isnt null
   **/
  static assertNotNull(val, name) {
    return Test.assertNot(val, null, name)
  }
  
  /**
   * Perform one test
   **/
  static one (test) {
    console[test.success ? "log" : "error"](
      `Test ${test.name ? test.name+" " : ""}${test.success ? "Passed" : "Failed"}`
    )
    
    return test.success
  }
  
  /**
   * Perform many tests
   **/
  static all(...tests) {
    let success = 0
    
    if (tests.length == 0) {
      console.log("No tests to run")
      
      return 100
    }
    
    tests.forEach((test, index) => {
      if (!test.name) test.name = index + 1
      
      if (Test.one(test)) success ++
    })
    
    let p = Math.floor(100 * success / tests.length)
    
    console.log('='.repeat(45))
    console[p === 100 ? "log" : "warn"](
      `${p}% Tests passed`
    )
    
    return p
  }
  
  /**
   * Perform many tests, throw an error if any
   * of them fail
   **/
  static allDepend(...tests) {
    if (Test.all(...tests) != 100) {
      throw Error("Not all tests passed")
    }
  }
}

/**
 * Demo and self-test cases
 **/ 
importModule("shouldDemo")(module, () => {
  Test.allDepend(
    // Assert that 3 is, in fact, 3
    Test.assert(3, 3, "Assert"),
    
    // Assert that 3 is not 4
    Test.assertNot(3, 4, "AssertNot"),
    
    // Assert that 3 is not null
    Test.assertNotNull(3, "AssertNotNull"),
    
    // Create a custom testing function
    // that will throw an error, which is
    // expected (argument 3 = wantsError)
    Test.test(() => {throw new Error()}, "InverseWillPass", true),
  
    // No error, passes
    Test.test(() => {}, "CustomWillPass")
  )
})

module.exports = Test