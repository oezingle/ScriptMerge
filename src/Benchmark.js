// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: magic;
/**
 * FILE: Benchmark.js
 *
 * A dead-simple benchmarking suite
 * 
 * @author oezingle (oezingle@gmail.com)
 **/

const Benchmark = class {
  constructor (title = "Benchmark") {
    this.title = title
    
    this.steps = []
  }
  
  step(name) {
    const time = Date.now()
    
    this.steps.push({name,time})
  }
  
  start () {
    this.starting = Date.now()
  }
  
  finish () {
    const end = Date.now()
    
    const delta = end - this.starting
    
    const seconds = delta / 1000
    
    console.log(`${this.title} Finished `.padEnd(46, '='))  
    console.log(`Time: ${seconds}s`)
    
    this.steps.forEach(({name, time}, i) => {
      const next = this.steps[i+1]?.time ?? end
      
      const stepDelta = next - time
      
      const stepP = (stepDelta/delta) * 100
      
      console.log(` - ${stepP.toFixed(1).toString().padStart(4)}% ${name}`)
    })
    
    console.log("Run Benchmark multiple times for best results")
    
    console.log('='.repeat(46))
  }
}

importModule("shouldDemo")(module, () => {
  let benchmark = new Benchmark()
  
  benchmark.start()
  
  benchmark.step('For')
  for (let i = 0; i < 1000000; i++) {
  }
  
  benchmark.step("While")
  let i = 0
  while (i < 1000000) i++
  
  benchmark.step("Fast")
  
  for (let q = 0; q < 100000; q ++) {}
  
  benchmark.finish()
})

module.exports = Benchmark