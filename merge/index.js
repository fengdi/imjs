/*
*
* im模块合并器
*
* 请先配置config.json:

{
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

var jsonMinify = function(json) {

  var tokenizer = /"|(\/\*)|(\*\/)|(\/\/)|\n|\r/g,
  in_string = false,
  in_multiline_comment = false,
  in_singleline_comment = false,
  tmp, tmp2, new_str = [], ns = 0, from = 0, lc, rc
  ;

  tokenizer.lastIndex = 0;

  while (tmp = tokenizer.exec(json)) {
    lc = RegExp.leftContext;
    rc = RegExp.rightContext;
    if (!in_multiline_comment && !in_singleline_comment) {
      tmp2 = lc.substring(from);
      if (!in_string) {
        tmp2 = tmp2.replace(/(\n|\r|\s)*/g,"");
      }
      new_str[ns++] = tmp2;
    }
    from = tokenizer.lastIndex;

    if (tmp[0] == "\"" && !in_multiline_comment && !in_singleline_comment) {
      tmp2 = lc.match(/(\\)*$/);
      if (!in_string || !tmp2 || (tmp2[0].length % 2) === 0) {   // start of string with ", or unescaped " character found to end string
        in_string = !in_string;
      }
      from--; // include " character in next catch
      rc = json.substring(from);
    }
    else if (tmp[0] == "/*" && !in_string && !in_multiline_comment && !in_singleline_comment) {
      in_multiline_comment = true;
    }
    else if (tmp[0] == "*/" && !in_string && in_multiline_comment && !in_singleline_comment) {
      in_multiline_comment = false;
    }
    else if (tmp[0] == "//" && !in_string && !in_multiline_comment && !in_singleline_comment) {
      in_singleline_comment = true;
    }
    else if ((tmp[0] == "\n" || tmp[0] == "\r") && !in_string && !in_multiline_comment && in_singleline_comment) {
      in_singleline_comment = false;
    }
    else if (!in_multiline_comment && !in_singleline_comment && !(/\n|\r|\s/.test(tmp[0]))) {
      new_str[ns++] = tmp[0];
    }
  }
  new_str[ns++] = rc;
  return new_str.join("");
};
    
  (function(){

      var fs = require("fs");
      var path = require("path");
      var vm = require("vm");

      //配置信息
      //var config = require("./config.json");
      var config = JSON.parse(jsonMinify(fs.readFileSync("./config.json").toString()));

      var im = config.impath || process.mainModule.filename || "./";

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
            return JSON.stringify(moduleData).replace('"'+RS+'"', function(){
              //参数2不能直接传字符串 因为有： \\1匹配1  \\$& 指原字符串 
              
              return f.toString();
            });
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
  })();








