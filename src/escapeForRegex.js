// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
/**
 * FILE: escapeForRegex.js
 *
 * Sanitize a string for use in regex
 * 
 * Adapted from https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
 **/

const escapeForRegex = (string) => {
      // Sanitize by escaping characters
    return string.replace(
      /[.*+?^${}()|[\]\\]/g, 
      '\\$&'
    )
}

module.exports = escapeForRegex