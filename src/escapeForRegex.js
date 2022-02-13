// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
const escapeForRegex = (string) => {
      // Sanitize by escaping characters
    return string.replace(
      /[.*+?^${}()|[\]\\]/g, 
      '\\$&'
    )
}

module.exports = escapeForRegex