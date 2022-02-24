// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
/**
 * FILE: uuidGen.js
 * 
 * Generate random identifiers of a given 
 * length and base (1-36)
 * 
 * @author oezingle (oezingle@gmail.com)
 **/

const uuidGen = (digits=8, base=36) => {
  return Math.floor(
    Math.random() * base ** digits
  )
    .toString(base)
    .padStart(digits, 0)
    .toUpperCase()
}

module.exports = uuidGen