/*
*
* im模块合并器
*
* 请先配置config.json:

{
  "impath":"..\\im.js",  //im.js或者im-min.js 相对此文件路径
  "modules":[            //即将打包的模块路径 
    "..\\test\\d.js",
    "..\\test\\c.js",
    "..\\test\\b.js",
    "..\\test\\a.js"
  ],
  "out":"..\\test\\merge.js"  //打包输出路径
}
* 然后用node执行此文件

注意：
目前合并仅支持模块为标准的写法：
define(function(){
  var foo = "bar";   //你的代码;
  return foo;
});

不支持以下形式的模块：
var foo = "bar";     //你的代码（写到外面）;
define(function(){
  return foo;
});

*
*/

var fs = require("fs");
var path = require("path");
var vm = require("vm");
//配置信息
var config = require("./config.json");

var im = config.impath;

//类型判断
var type = function(obj, type) {
	var ts = {}.toString,
		t = obj===null ? 'null' :
		(typeof obj=='undefined' && 'undefined' || ts.call(obj).slice(8,-1).toLowerCase());
	return type ? t===type : t;
}

function merge(file,callback){
  var code = [];

  if(!type(file,"array")){
    file = [file];
  }
  var that = this;
  
  file.forEach(function(file){
  
    this.define = function(deps, factory){
      var RS = '{${#factory#}$}';
      var moduleData = {
        uri:path.relative(path.dirname(im),file).replace(new RegExp("\\"+path.sep,'g'),"/"),//路径要转换成相对im.js路径
        deps:[],
        factory:RS
      };
      var f = function(){};
      var args = arguments;
      
      if(args.length==1){
        if(type(deps,"function")){
          f = deps;
        }else{
          moduleData.factory = deps;
        }
      }else{
        moduleData.deps = deps;
        
        f = factory;
      }
      return JSON.stringify(moduleData).replace('"'+RS+'"',f.toString());
    };
    
    
    code.push(vm.runInThisContext(fs.readFileSync(file)));
  });
  
  
  code = ';defines(['+code.join(",")+']);';
  callback(code);
}

merge(config.modules,function(code){
  fs.writeFileSync(config.out, code);
  
  console.log(config.out+" OK!");
});


