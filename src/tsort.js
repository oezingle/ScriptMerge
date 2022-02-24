// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: filter;
/**
 * FILE: tsort.js
 * 
 * A general topigraphical sort
 * 
 * @author oezingle (oezingle@gmail.com)
 **/



/**
 * Topigraphically sort an array of edges. 
 * Edges are directional, [ID, depend_ID]
 *
 * @param edges an array of edges
 *
 * @returns an array of nodes, where the most depended upon are first
 **/
const tsort = edges => {
  let nodes = {}
  
  let nodesOrdered = []
  
  // Generate nodes by edge
  edges.forEach(edge => {
    if (nodes[edge[0]]) {
      nodes[edge[0]] ++
    } else {
      nodes[edge[0]] = 1
    }
    
    if (!nodes[edge[1]]) {
      nodes[edge[1]] = 0
    }
  })
  
  while (Object.keys(nodes).length) {
    Object.entries(nodes)
    .forEach(([key,val])=>{
      if (val <= 0) {
        nodesOrdered.push(key)
        
        // Find every edge that references it
        edges.forEach(edge => {
          if (edge[1] == key)
            nodes[edge[0]] --
        })
        
        delete nodes[key]
      }
    })
    
    //break
  }
  
  return nodesOrdered
}

importModule("shouldDemo")(module, () => {
  const sorted = tsort([
    ["A", "B"],
    ["A", "C"],
    ["B", "C"]
  ])
  
  console.log('='.repeat(46))
  
  console.log(sorted)
})

module.exports = tsort