# ScriptMerge User Manual

## What? Why?
ScriptMerge was created to address the need for a way to "flatten" any importModule calls in Scriptable scripts. It's the third iteration of such a project that I've worked on, and the first I'm satisfied with.

## Features
 - Per-module variable prefixing
 - Dependency-only variable collection
 - module and GUI endpoints
 - built-in minification

## Installing

### Pre-built
ScriptMerge can be used as a pre-merged flat file. See this project's [releases](https://github.com/oezingle/ScriptMerge/releases)

### Building
ScriptMerge can build itself from the collection of modules it depends upon. Either select ScriptMerge.js through the GUI or build it using the module's ScriptMerge class


## Usage

### GUI
The gui can be called with 
ScriptMerge.gui([path])
Omitting the path prompts the user to select a file. Once a path has been set, the user can modify the settings object or merge the script. The user then decides what to do with the merged output

### ScriptMerge class
Create a ScriptMerge instance using
new ScriptMerge(<content>, [settings])
or
ScriptMerge.fromFile(<path>, [settings])
to merge the file, use a ScriptMerge instance and call run() 


# Included in this repo
```
ScriptMerge/
    src/ - Sources to all dependencies
        AlertFactory.js - Easy alert building
        Benchmark.js - Dead simple benchmark utility
	BracketBuffer.js - Helps determine scope
        configureObject.js - runtime configuration menus for arbitrary objects
        escapeForRegex.js - sanitizes strings for use in regex
        extension.js - determine extension of file (dep. for HardenedFS)
        HardenedFS.js - FileManager analogue with errors instead of warnings
        minify.js - Minify javascript strings
        obfuscate.js - Broken javascript string obfuscator
        ObjectiveCProxy.js - Proxy-like functionality for Scriptable APIs (dep. for AlertFactory)
        ScriptMerge.js - Main ScriptMerge file, has bad feng shui
        shouldDemo.js - Utility to check if a file is a module or the main script
        stacktrace.js - Add function names to errors
        StringRemover.js - Temporarily remove strings from javascript
        Test.js - Unit testing framework
        tryImport.js - Add module of origin to error messages
	tsort.js - Sort dependencies
        uuidGen.js - Utility to generate unique identifiers
    dist/ - Prebuilt flat ScriptMerge file
        ScriptMerge.js - minified for your use
	ScriptMerge built.scriptable - Scriptable-ready built version
```

# TODOs
See `src/ScriptMerge.js`

# License
See LICENSE.txt. This project is licensed under the GNU GPLv3 License.
