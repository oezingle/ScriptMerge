// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: sitemap; share-sheet-inputs: file-url;
let SM_YCO6MUH7_extension=(path)=>{return path.substring(path.lastIndexOf('.')+1,path.length)||path};;let SM_YCO6MUH7=SM_YCO6MUH7_extension;;let SM_W4GQLQ6A_BracketBuffer=class{constructor(content,pos=0,debug=false){this.content=content;this.pos=pos;this.buff="";this.curr='';this.debug=debug};at(pos){return this.from(0,pos)};from(start,end){if(!start)start=0;if(!end)end=this.content.length-1;this.pos=start;while(this.pos<=end){this.move()};return this};charIsCancelled(){const BACKSLASH='\\';let backslashCount=0;let minusIndex=1;let prev;prev=this.content[this.pos-minusIndex];while(prev==BACKSLASH){backslashCount++;minusIndex++;prev=this.content[this.pos-minusIndex]};return backslashCount%2==1};move(){this.oobCheck();const brackets="{}[]()";const quotes="'\"`";const regex="/";this.curr=this.content[this.pos];const last=this.buff.substr(-1)||null;if(brackets.includes(this.curr)){if(quotes.includes(last)||regex.includes(last)){}else{this.buff+=this.curr}}else if(quotes.includes(this.curr)){if(!regex.includes(last)){if(quotes.includes(last)){if(last==this.curr){if(!this.charIsCancelled()){this.buff+=this.curr}}}else{this.buff+=this.curr}}}else if(regex.includes(this.curr)){let slashBeforeLineEnd=(()=>{let afterSlash=this.content.substr(this.pos);let newline=afterSlash.indexOf("\n");if(newline===-1)newline=Number.MAX_SAFE_INTEGER;let slash=afterSlash.indexOf("/");if(slash===-1)return false;return slash<newline})();let precedingIsAlphaNumeric=(()=>{let index=this.pos;let curr=this.content[index];while(index>0){index-=1;curr=this.content[index];if(!curr.match(/\s/)){return Boolean(curr.match(/[a-zA-Z0-9_$]/))}};return false})();if(!quotes.includes(last)){if(regex.includes(last)){if(last==this.curr){if(!this.charIsCancelled()){this.buff+=this.curr}}}else{if(slashBeforeLineEnd&&(!precedingIsAlphaNumeric)){this.buff+=this.curr}}}};const last2=this.buff.substr(-2);const pairs=["[]","{}","()"].concat(quotes.split('').concat(regex.split('')).map(char=>{return char.repeat(2)}));if(pairs.includes(last2)){this.buff=this.buff.substr(0,this.buff.length-2)};this.pos++;return this};moveUntilEmpty(){while(!this.isEmpty()){this.move()};return this};moveUntilLineEnd(){while(![";","\n"].includes(this.curr)){this.move()};return this};hasNext(){return this.pos<=this.content.length};oobCheck(){if(!this.hasNext()){if(this.debug){console.log("BBOOB: content ========");console.warn(this.content);console.log("BBOOB: buffer =========");console.warn(this.buff)};throw new Error("BracketBuffer Out of Bounds Error")}};isEmpty(){return this.buff.length===0};static from(content,start,end){return new this(content).from(start,end)};static at(content,pos){return this.from(content,0,pos)}};let SM_W4GQLQ6A=SM_W4GQLQ6A_BracketBuffer;;let SM_PQHOO9AD_StringRemover=class{constructor(content){this.content=content;this.strings=[];this.removeStrings()};getContent(){return this.content};setContent(content){this.content=content};prepend(newlet){this.setContent(newlet+this.getContent());this.removeStrings()};append(newlet){this.setContent(this.getContent()+newlet);this.removeStrings()};concat=this.append;removeStrings(){const brackets="{}()[]".split("");let bb=new BracketBuffer(this.content);let lastBuff="";let start=-1;let replacements=[];this.strings.forEach(string=>{replacements.push({slice:null,replacmeent:""})});while(bb.hasNext()){bb.move();if(lastBuff.length!=bb.buff.length){let lastBuffered=bb.buff.slice(-1);if(lastBuffered&&!brackets.includes(lastBuffered)){if(start===-1){start=bb.pos-1}}else if(lastBuff.length>bb.buff.length&&start!==-1&&!brackets.includes(bb.curr)){let slice=this.content.substring(start,bb.pos);let replacement=undefined;switch(slice[0]){case"/":{let pos=bb.pos;let flags="igsmyu".split("");while(flags.includes(this.content[pos])){pos++;};slice=this.content.substring(start,pos);replacement=`@StringRemover_Regex[${replacements.length}]`;break};case"`":{const formatVar=/\${([^}]*)}/g;let vars=[];slice.match(formatVar)?.forEach(m=>{vars.push(m.replace(formatVar,"$1"))});replacement="@StringRemover_Format["+replacements.length+"]"+" "+vars.join(" ")+" "+"@StringRemover_End";break};default:{replacement=`@StringRemover_Simple[${replacements.length}]`;break}};if(replacement){replacements.push({slice,replacement})};start=-1}};lastBuff=bb.buff};replacements.forEach(({slice,replacement})=>{if(!slice||!replacement)return;this.content=this.content.replace(slice,replacement);this.strings.push(slice)})};reinsertStrings(){let newContent=this.content;const r=/@StringRemover_([a-zA-Z]+)\[(\d+)\]/g;for(let i=0;i<10;i++){let match;while((match=r.exec(newContent))!=null){switch(match[1]){case"Format":{const endS='@StringRemover_End';const end=newContent.indexOf(endS,match.index)+endS.length;const slice=newContent.substring(match.index,end);const index=Number(match[2]);newContent=newContent.replace(slice,()=>this.strings[index]);break};default:{const index=Number(match[2]);newContent=newContent.replace(match[0],()=>this.strings[index]);break}}}};return newContent}};let SM_PQHOO9AD=SM_PQHOO9AD_StringRemover;;let SM_6B72QVGR_escapeForRegex=(string)=>{return string.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')};;let SM_6B72QVGR=SM_6B72QVGR_escapeForRegex;;let SM_G9NXJ3RG_uuidGen=(digits=8,base=36)=>{return Math.floor(Math.random()*base**digits).toString(base).padStart(digits,0).toUpperCase()};;let SM_G9NXJ3RG=SM_G9NXJ3RG_uuidGen;;let SM_B4SJIAWJ_ObjectiveCProxy=class{constructor(target,handler){this.target=target;this.handler=handler;this.patch()};_call(method,...args){return this.target[method](...args)};patch(){const prototype=this.target.constructor.prototype;const keys=Object.getOwnPropertyNames(prototype);for(let key of keys){if(!this[key]){const val=this.target[key];if(typeof val!="function")continue;if(this.handler.get){this[key]=(...args)=>{let fn=this.handler.get(this.target,key);if(fn==this.target[key]){return this._call(key,...args)}else{return fn(...args)}}}else{this[key]=(...args)=>{return this._call(key,...args)}}}}}};let SM_B4SJIAWJ=SM_B4SJIAWJ_ObjectiveCProxy;;let SM_HFXEME8K_tsort=edges=>{let nodes={};let nodesOrdered=[];edges.forEach(edge=>{if(nodes[edge[0]]){nodes[edge[0]]++;}else{nodes[edge[0]]=1};if(!nodes[edge[1]]){nodes[edge[1]]=0}});while(Object.keys(nodes).length){Object.entries(nodes).forEach(([key,val])=>{if(val<=0){nodesOrdered.push(key);edges.forEach(edge=>{if(edge[1]==key)nodes[edge[0]]--;});delete nodes[key]}})};return nodesOrdered};let SM_HFXEME8K=SM_HFXEME8K_tsort;;let SM_U4JDWI1K_Benchmark=class{constructor(title="Benchmark"){this.title=title;this.steps=[]};step(name){const time=Date.now();this.steps.push({name,time})};start(){this.starting=Date.now()};finish(){const end=Date.now();const delta=end-this.starting;const seconds=delta/1000;console.log(`${this.title} Finished `.padEnd(46,'='));console.log(`Time: ${seconds}s`);this.steps.forEach(({name,time},i)=>{const next=this.steps[i+1]?.time??end;const stepDelta=next-time;const stepP=(stepDelta/delta)*100;console.log(` - ${stepP.toFixed(1).toString().padStart(4)}% ${name}`)});console.log("Run Benchmark multiple times for best results");console.log('='.repeat(46))}};let SM_U4JDWI1K=SM_U4JDWI1K_Benchmark;;let SM_YXBWALGG=(module,callback)=>{const scriptName=Script.name();const fName=module.filename.replace(/.*\//,'').replace(".js",'');if(scriptName===fName){if(callback){callback()}else{return true}};return false};let SM_4JZ59B37_extension=SM_YCO6MUH7;;let SM_4JZ59B37_HardenedFS=class{constructor(iCloud){this.patch();this.instance=iCloud?FileManager.iCloud():FileManager.local()};_call(method,...args){return this.instance[method](...args)};_ignore=this._call;_errNotExists(method,filePath){if(!this.instance.fileExists(filePath)){throw new Error(`File ${filePath} does not exist`)};return this._call(method,filePath)};patch(){const notExistsProne=["readString","readImage","read"];const keys=Object.getOwnPropertyNames(FileManager.prototype);for(let key of keys){if(!this[key]){const val=FileManager.prototype[key];if(typeof val!="function")continue;if(notExistsProne.includes(key)){this[key]=(...args)=>{return this._errNotExists(key,...args)}}else{this[key]=(...args)=>{return this._call(key,...args)}}}}};static local(){return new SM_4JZ59B37_HardenedFS(false)};static iCloud(){return new SM_4JZ59B37_HardenedFS(true)};static extension=SM_4JZ59B37_extension;extension=SM_4JZ59B37_extension;static directory=(path)=>{return path.replace(/\/(?:.(?!\/))+$/m,'')};directory=SM_4JZ59B37_HardenedFS.directory;path(path){const docs=this.instance.documentsDirectory();return path.replace(/\/[^\/]*\/\.\./g,'').replace(/^~/m,docs)}};let SM_4JZ59B37=SM_4JZ59B37_HardenedFS;;let SM_X43ZDOG8_StringRemover=SM_PQHOO9AD;;let SM_X43ZDOG8_minify=script=>{const multiReplace=(content,patterns)=>{let out=content;patterns.map(([pattern,replacement])=>{out=out.replace(pattern,replacement)});return out};script=multiReplace(script,[[/\/\*([\s\S]*?)\*\//g,''],[/^\s*\/\/[^\n]*/gm,''],[/\s+\/\/[^\n]*/gm,'']]);let sr=new SM_X43ZDOG8_StringRemover(script);sr.setContent(multiReplace(sr.getContent(),[[/(if|for|while)\s*\((.*)\)\s*/g,'$1($2)'],[/else\s*/g,'else '],[/(\+\+|--)\n+/gm,"$1;"],[/(?![a-zA-Z0-9_$])(\/[^\/]*\/[igsmyu]*)\s+([a-zA-Z0-9_$])/g,'$1;$2'],[/\s*([^a-zA-Z\s$0-9_])/g,'$1'],[/([^a-zA-Z\s$0-9_])\s*([^a-zA-Z\s$0-9_])/g,'$1$2'],[/([\[\{\(,\?\:])\s+/g,'$1'],[/([\]\}\)0-9])\s*\n\s*/g,'$1;'],[/\s*([\]\}\)])/g,"$1"],[/([aA-zZ"'`])\s*\n\s*/g,'$1;'],[/([^a-zA-Z\s])\s*/g,'$1']]));script=sr.reinsertStrings();while(script[0]=='\n')script=script.substr(1);return script};let SM_X43ZDOG8=SM_X43ZDOG8_minify;;let SM_0H08HVNP_ObjectiveCProxy=SM_B4SJIAWJ;;let SM_0H08HVNP_AlertFactory=class extends SM_0H08HVNP_ObjectiveCProxy{constructor(title="",message=""){const alert=new Alert();alert.title=title;alert.message=message;let index=0;let indices={};let handler={get:(obj,prop)=>{if(prop=="present"){return(fullscreen)=>{return obj.present(fullscreen).then(index=>{return indices[index](obj)})}}else if(prop.match(/add\S*Action/)){return(title,fn)=>{if(!fn)fn=()=>{};obj[prop](title);switch(prop){case"addCancelAction":{indices[-1]=fn;break};default:{indices[index++]=fn;break}};return this}};if(obj[prop]instanceof Function){return(...args)=>{obj[prop](...args);return this}}else{return obj[prop]}}};super(alert,handler)}};let SM_0H08HVNP=SM_0H08HVNP_AlertFactory;;let SM_SV637WG0_symbolImage=name=>SFSymbol.named(name).image;;let SM_SV637WG0_AlertFactory=SM_0H08HVNP;;let SM_SV637WG0_ConfigurationPresets={_default:{number:{set:(obj,prop)=>{const val=String(obj[prop]);return new SM_SV637WG0_AlertFactory(prop,"Set Numerical Value").addTextField("Input Value",val).addAction("Done",(alert)=>{obj[prop]=Number(alert.textFieldValue(0))}).addCancelAction("Cancel").present()}},boolean:{get:(obj,prop,row)=>{const val=obj[prop];const name=val?"checkmark.circle.fill":"circle";const cell=UITableCell.image(SM_SV637WG0_symbolImage(name));cell.rightAligned();row.addCell(cell);return row},set:(obj,prop)=>{obj[prop]=!obj[prop]}},string:{set:(obj,prop)=>{const val=String(obj[prop]);return new SM_SV637WG0_AlertFactory(prop,"Set String Value").addTextField("Input Value",val).addAction("Done",(alert)=>{obj[prop]=alert.textFieldValue(0)}).addCancelAction("Cancel").present()}},object:{get:(obj,prop,row)=>{const val=obj[prop];let preview=`{...}`;const cell=UITableCell.text(preview);cell.rightAligned();row.addCell(cell);return row},set:(obj,prop,handler)=>SM_SV637WG0_configureObject(obj[prop],handler[prop])},array:{},any:{get:(obj,prop,row)=>{const val=obj[prop];let preview=String(val);if(preview.length>32){preview="..."};const cell=UITableCell.text(preview);cell.rightAligned();row.addCell(cell);return row},set:()=>{}}},hidden:{get:()=>{}}};let SM_SV637WG0_getHandle=(val,handle)=>{let type=typeof val;if(type=="object"&&val instanceof Array)type="array";const getter=handle?.get??SM_SV637WG0_ConfigurationPresets._default[type]?.get??SM_SV637WG0_ConfigurationPresets._default.any.get;const setter=handle?.set??SM_SV637WG0_ConfigurationPresets._default[type]?.set??SM_SV637WG0_ConfigurationPresets._default.any.set;return{get:getter,set:setter}};let SM_SV637WG0_configureObject=(obj,handler={})=>{let keys=Object.getOwnPropertyNames(obj);const table=new UITable();table.showSeparators=true;const populateTable=()=>{table.removeAllRows();for(let key of keys){const val=obj[key];let handle=SM_SV637WG0_getHandle(val,handler[key]);let row=new UITableRow();row.addText(key,typeof val);row=handle.get(obj,key,row);if(row){row.dismissOnSelect=false;row.onSelect=async()=>{await handle.set(obj,key,handler);populateTable()};table.addRow(row)}};table.reload()};populateTable();return table.present()};let SM_SV637WG0={configureObject:SM_SV637WG0_configureObject,ConfigurationPresets:SM_SV637WG0_ConfigurationPresets};;const HardenedFS=SM_4JZ59B37;const BracketBuffer=SM_W4GQLQ6A;const StringRemover=SM_PQHOO9AD;const minify=SM_X43ZDOG8;const escapeForRegex=SM_6B72QVGR;const uuidGen=SM_G9NXJ3RG;const AlertFactory=SM_0H08HVNP;const tsort=SM_HFXEME8K;const Benchmark=SM_U4JDWI1K;const{configureObject,ConfigurationPresets}=SM_SV637WG0;const fs=HardenedFS.iCloud();const buildPath=(path)=>fs.path(path);const ScriptMerge=class{static defaultSettings={debug:false,minify:true,benchmark:false,plugins:[]};static fromFile(path,settings){const content=fs.readString(path);return new this(content,settings)};constructor(content,settings){this.content=content;this.settings={...this.constructor.defaultSettings,...settings};this.runtime={};if(this.settings.debug)console.log("[ScriptMerge] Debugger Enabled");this.settings.plugins.forEach(plugin=>{this.addToToolChain(plugin.step,plugin.function);if(this.settings.debug)console.log(`[ScriptMerge] Added Plugin ${plugin.name ?? "(unknown)"}`)})};run_add_depend(path,depend){this.runtime.depends.push([path,depend])};run_get_module(path){if(this.runtime.modules[path])return;const local=path.replace(fs.documentsDirectory(),"");if(this.settings.debug){console.log(`[ScriptMerge] Merging module: ${local}`)};if(this.settings.benchmark)this.runtime.modulebm.step(`Module ${local}`);let mod=new Module(fs.readString(path));if(this.settings.benchmark)this.runtime.modulebm.step(`Spider ${local}`);const spider=new Spider(mod.exported);mod.exported=spider.content;this.runtime.modules[path]=mod;spider.depends.forEach(depend=>{this.run_add_depend(path,depend);this.run_get_module(depend)})};run_tsort(){const deps=tsort(this.runtime.depends);this.runtime.dependsOrdered=deps};run_remove_imports(){Object.entries(this.runtime.modules).forEach(([path,mod])=>{this.runtime.output=this.runtime.output.replaceAll(`importModule("${path}")`,mod.exportName)})};run(){this.runtime={modules:{},depends:[],dependsOrdered:[],output:""};const bm=new Benchmark();if(this.settings.benchmark){bm.start();bm.step("Spider");this.runtime.modulebm=new Benchmark("Dependency Collection");this.runtime.modulebm.start();this.runtime.modulebm.step("Spider root")};this.runtime.spider=new Spider(this.content);this.runtime.spider.depends.forEach(depend=>{this.run_add_depend("root",depend);this.run_get_module(depend)});if(this.settings.benchmark){this.runtime.modulebm.finish();bm.step("Dependency Sort")};this.run_tsort();if(this.settings.benchmark)bm.step("Add Content");this.runtime.dependsOrdered.forEach(dep=>{if(dep==="root")return;this.runtime.output+=this.runtime.modules[dep].exported;if(this.settings.debug){this.runtime.output+="\n\n"}});let root=this.runtime.spider.content;while(root.substr(0,2)=="//"){root=root.substring(root.indexOf("\n"))};this.runtime.output+=root;if(this.settings.benchmark)bm.step("Remove importModule calls");this.run_remove_imports();if(this.settings.minify){if(this.settings.debug)console.log("[ScriptMerge] Minifying");if(this.settings.benchmark)bm.step("Minify");this.runtime.output=minify(this.runtime.output)};if(this.settings.benchmark){bm.finish()};return this.runtime.output};static fromFile(path,settings){const content=fs.readString(path);return new this(content,settings)};static ToolChainSteps={READ_FILE:"readFile",};addToToolChain(step,func,name){if(!(step in this.constructor.ToolChainSteps)){throw new Error("Unknown Toolchain step")};this.settings.plugins.push({step,func,name})};static gui(path){const errHandle=err=>{console.error(err);throw err};const namedHandle=(name)=>{return err=>{console.error(`In ${name}: ${err}`);throw err}};const cancel=()=>{throw new Error("[ScriptKit] Cancelled")};let settings=this.defaultSettings;const runMenu=async(path)=>{const fileName=path.replace(fs.directory(path)+"/","");const alert=new AlertFactory("ScriptMerge - "+fileName).addAction("Run",()=>{return true}).addAction("Settings",()=>{return configureObject(settings,{plugins:ConfigurationPresets.hidden}).then(()=>runMenu(path),namedHandle("Settings Menu"))}).addCancelAction("Cancel",cancel);while(true){const ret=await alert.present();if(ret!=undefined){return{settings,path}}}};const setpath=async()=>{if(path){return path}else{return new AlertFactory("ScriptMerge","A path has not been set. How would you like to continue?").addAction("Select A File",()=>{return DocumentPicker.open(["com.netscape.javascript-source"]).then(paths=>paths[0])}).addAction("Provide a path",()=>{return new AlertFactory("ScriptMerge - Provide a Path","'~' can be used for the Scriptable Documents directory").addTextField("~/file.js").addAction("Confirm",alert=>{return buildPath(alert.textFieldValue(0))}).addCancelAction("Cancel",cancel).present()}).addAction("User Manual",()=>{return QuickLook.present(`
ScriptMerge User Manual

What? Why?
ScriptMerge was created to address the need for a way to "flatten" any importModule calls in Scriptable scripts. It's the third iteration of such a project that I've worked on, and the first I'm satisfied with.

Features
 - Per-module variable prefixing
 - Dependency-only variable collection
 - module and GUI endpoints
 - built-in minification


Installing

Pre-built
ScriptMerge can be used as a pre-merged flat file. See this project's releases

Building
ScriptMerge can build itself from the collection of modules it depends upon. Either select ScriptMerge.js through the GUI or build it using the module's ScriptMerge class


Usage

GUI
The gui can be called with 
ScriptMerge.gui([path])
Omitting the path prompts the user to select a file. Once a path has been set, the user can modify the settings object or merge the script. The user then decides what to do with the merged output

ScriptMerge class
Create a ScriptMerge instance using
new ScriptMerge(<content>, [settings])
or
ScriptMerge.fromFile(<path>, [settings])
to merge the file, use a ScriptMerge instance and call run()
            `).then(cancel)}).addCancelAction("Cancel",cancel).present()}};setpath().then(path=>{if(fs.fileExists(path)){return path}else{throw new Error("[ScriptMerge] Specified File Not Found")}},errHandle).then(runMenu,errHandle).then(({settings,path})=>{return this.fromFile(path,settings)},namedHandle("run menu")).then(inst=>{inst.run();return inst},namedHandle("Create Instance")).then(inst=>{const output=inst.runtime.output;new AlertFactory("ScriptKit - Success","How would you like to use your merged file?").addAction("Copy To Clipboard",()=>Pasteboard.copy(output)).addCancelAction("Cancel",cancel).present()},namedHandle("Run Instance")).catch(namedHandle("Output time"))};static Plugin=class{constructor(step,func,name){this.step=step;this.function=func;this.name=name}}};const ENABLE_IMPLICIT_DEFINITON=false;const Module=class{constructor(content,debug){this.debug=debug;content+='\n';this.content=";"+minify(content);this.uuid=uuidGen();this.exportName=`SM_${this.uuid}`;this.modify();this.getExports()};getExports(){this.exported="";const exports=this.getVar("module.exports");let nameMap={};if(exports){let sr=new StringRemover("");const depends=this.getDepends(exports);for(let key in depends){const val=depends[key];if(val){const name=`SM_${this.uuid}_${key}`;sr.prepend(`let ${name}=${val};`);nameMap[key]=name}};sr.append(`let ${this.exportName}=${exports};`);Object.entries(nameMap).forEach(([name,replacer])=>{let r=new RegExp(`([^a-zA-Z0-9_$.])${escapeForRegex(name)}(?![=:a-zA-Z0-9_$](?!=))`,'g');sr.setContent(sr.getContent().replace(r,"$1"+replacer))});this.exported=sr.reinsertStrings()}else{throw new Error("Module used unsupported export scheme")};return this.exported};modify(){this.content=this.content.replace(/function\s+(\S+)\s*\(([^\)]*)\)/g,"const $1 = ($2) =>").replace(/function\s*\(([^\)]*)\)/g,"($1) =>").replace(/class\s+(?!extends)(\S+)/g,"const $1 = class");const r=/(?:(?:let|const|var)\s*([a-zA-Z0-9_$])|module\.exports)\s*=\s*\{/g;let match;while((match=r.exec(this.content))!=null){const start=match.index;try{const end=new     BracketBuffer(this.content,start).moveUntilLineEnd().moveUntilEmpty().pos;let slice=this.content.substring(start,end);slice=slice.substr(slice.indexOf("{"));const original=slice;slice=slice.replace(/([,{])\s*([a-zA-Z_$][a-zA-Z$_0-9]*)\s*}/g,'$1$2: $2}');slice=slice.replace(/([,{])\s*([a-zA-Z_$][a-zA-Z$_0-9]*)\s*,/g,'$1$2: $2,');this.content=this.content.replace(original,slice)}catch(e){console.warn(e)}}};findDepends=this.constructor.findDepends;static findDepends(content){content=new StringRemover(content).getContent();const varNameTestGen=(valid)=>{return`[${valid?'':'^'}a-zA-Z$_]`+`[${valid?'':'^'}a-zA-Z0-9_$]*`};const validVarName=varNameTestGen(true);const invalidVarName=varNameTestGen(false);const invalidVarNameR=new RegExp(invalidVarName,'g');const dotAttr=new RegExp(`(${validVarName}|\.)\\s*\\.${validVarName}`,'g');while(content!=content.replace(dotAttr,'$1')){content=content.replace(dotAttr,'$1')};const jsKeywords=['if','else','for','while','try','catch','return','throw','new','of','class','constructor','true','false','static','continue','break','switch','static'].concat(Object.getOwnPropertyNames(globalThis)).concat(["null"]);jsKeywords.forEach(keyword=>{const keywordRegex=new RegExp(`([^a-zA-Z0-9_$])${escapeForRegex(keyword)}(?![a-zA-Z0-9_$])`,'g');content=content.replace(keywordRegex,'')});content=content.replace(/this\.\S+/g,"").replace(/this/g,"");content=content.replace(/[0-9]/g,"");const decl=new RegExp(`(?:const|let|var)\\s+(${validVarName})`);let match;while((match=decl.exec(content))!=null){const useOfVar=new RegExp(`${escapeForRegex(match[1])}(?![a-zA-Z0-9_])`,'g');content=content.replaceAll(match[0],'').replace(useOfVar,'')};const lambda=/\(([^\)]+)\)\s*=>/g;while((match=lambda.exec(content))!=null){const argumentz=match[1].replace(/\s+/g,'').split(',');argumentz.forEach(argument=>{const useOfVar=new RegExp(`${escapeForRegex(argument)}(?![a-zA-Z0-9_])`,'g');content=content.replace(useOfVar,'')})};content=content.replace(/(?:const|let|var)/g,"");content=content.replace(invalidVarNameR,' ').replace(/\s+/g,' ');const list=[...new Set(content.split(' '))].filter(Boolean);return list};getDepends(listOrContent){if(listOrContent instanceof Array){return this.getDependsFromList(listOrContent)}else if(typeof listOrContent=="string"){return this.getDependsFromContent(listOrContent)}};getDependsFromContent(content){let list=this.findDepends(content);return this.getDependsFromList(list)};getDependsFromList(dependencies,obj={}){dependencies.forEach(name=>{if(obj[name])return;const val=this.getVar(name);obj[name]=val?val:null;if(val){let subDepends=this.findDepends(val);this.getDependsFromList(subDepends,obj)}});return obj};getVar(name){const reName=escapeForRegex(name);const ePattern=new RegExp(`(const|let|var)\\s*${reName}\\s*=\\s*`,'g');const iPattern=new RegExp(`[\\s;]${reName}\\s*=\\s*`,'g');let match;let patterns=[ePattern,iPattern];for(const pattern of patterns){while((match=pattern.exec(this.content))!=null){let isGlobal=false;if(match[1]){isGlobal=BracketBuffer.at(this.content,match.index).isEmpty()}else{isGlobal=ENABLE_IMPLICIT_DEFINITON;if(name.includes("module.exports")){isGlobal=true}};if(isGlobal){const start=match.index+match[0].length;const end=new BracketBuffer(this.content,start).move().moveUntilLineEnd().moveUntilEmpty().pos;if(this.debug)console.log(`${name} gotten`);return this.content.substring(start,end)}}}}};const Spider=class{constructor(content,path){if(!path){this.dir=fs.documentsDirectory();this.path=undefined}else{this.path=path;this.dir=fs.directory(path)};this.content=content;this.sr=new StringRemover(minify(content));this.depends=[];this.aliases=['importModule'];this.getImportAliases();this.findImports()};static fromFile(path){if(fs.fileExists(path)){const content=minify(fs.readString(path));return new this(content,path)}else{console.warn(`Spider: Unable to load ${path}`)}};findImports(){this.aliases.forEach(alias=>{let pattern=new RegExp(`${alias}\\(\\s*@StringRemover_[a-zA-Z]+\\[(\\d+)\\]\\s*\\)`,'g');const matches=this.sr.getContent().match(pattern);if(!matches)return;for(let match of matches){const index=Number(match.replace(pattern,"$1"));const string=this.sr.strings[index];let fileName=string;fileName=fileName.substring(1,fileName.length-1);if(fs.extension(fileName)==fileName)fileName+=".js";fileName=`${this.dir}/${fileName}`;if(!fs.fileExists(fileName)){console.warn(`Spider: Unable to load ${fileName}`);continue};this.depends.push(fileName);this.content=this.content.replaceAll(`${alias}(${string})`,`importModule("${fileName}")`)}})};getImportAliases(){const pattern=/(\S*)\s*=\s*importModule[^\(]/g;const matches=this.content.match(pattern);if(!matches)return;for(let match of matches){const name=match.replace(pattern,'$1');this.aliases.push(name)}}};SM_YXBWALGG(module,()=>{if(args.fileURLs.length){args.fileURLs.forEach(file=>{ScriptMerge.gui(file)})}else{ScriptMerge.gui()}});module.exports=ScriptMerge
