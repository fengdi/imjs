//im.js v1.3 2014-06-05T18:33:00.087Z



//检测是否是node环境
if(typeof process == "object" 
    && "versions" in process 
    && "node" in process.versions){

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










}else{
//浏览器环境

// A tiny javascript module loader for the Web
// Im.js v1.3 | MIT Licensed
// https://github.com/fengdi/imjs
/*
 ______                                  
/\__  _\                    __           
\/_/\ \/     ___ ___       /\_\    ____  
   \ \ \   /' __` __`\     \/\ \  /',__\ 
    \_\ \__/\ \/\ \/\ \  __ \ \ \/\__, `\
    /\_____\ \_\ \_\ \_\/\_\_\ \ \/\____/
    \/_____/\/_/\/_/\/_/\/_/\ \_\ \/___/ 
                           \ \____/      
                            \/___/      
*/

(function(global){
var ud = void 0;
var doc = document;
var epa = [];
var slice = epa.slice;
var noop = function(){};
var rePtl = /^(\w+:\/\/\/?)(.*)/;
var LOADING = 1,   // loading
  SAVED = 2,     // saved
  LOADED = 3,    // ready
  COMPILING = 4, // compiling
  COMPILED = 5;   // available

//遍历
var forEach = epa.forEach ?
function(arr, fn) {
  arr.forEach(fn);
} :
function(arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn(arr[i], i, arr);
  }
};
//元素在数组中的位置
var indexOf = epa.indexOf ? 
function(arr, v) {
  return arr.indexOf(v);
} :
function(arr, v) {
  for (var i = 0, len = arr.length; i < len; i++) {
    if(v===arr[i]){
    	return i;
    }
  }
  return -1;
};

//去除字符串两端空白
var trim =  function( text ) {
	return (text || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "" );
};
//对象混合
var mix = function(a, b){
	for (var k in b) {
		a[k] = b[k];
	}
	return a;
};
//类型判断
var type = function(obj, type) {
	var ts = {}.toString,
		t = obj===null ? 'null' :
		(obj===ud && 'undefined' || ts.call(obj).slice(8,-1).toLowerCase());
	return type ? t===type : t;
};
//日志打印
var log = function(s,t){
	t = t || 'log';
	if('console' in global){
		console[t](s);
	}
};

//路径相关的处理函数
var path = {
	normalize : function (path) {
		var m
			,protocol = "";

		if(m = path.match(rePtl)){
			protocol = m[1];
			path = m[2];
		}

		if (path.indexOf(".") === -1) {
			return protocol + path;
		}
		var original = path.split("/");
		var ret = [];
		forEach(original, function(part){
			if(part!=""){
				if (part === "..") {
				  if (ret.length === 0) {
				    throw new Error("The path is invalid: " + path);
				  }
				  ret.pop();
				}else if (part !== ".") {
				  ret.push(part);
				}
			}
		});
		return protocol + ret.join("/").replace(":80/", "/");;
	},
	hostRoot:function(url) {
		var protocol = ""
			,original = ""
			,m;

		if(m = url.match(rePtl)){
			protocol = m[1];
			original = m[2].split("/")[0];
		}
		return protocol+original+"/";
	},
	dirname:function(path){
		if(!path.match(/\//)){
			return path = "./";
		}
		return path.replace(/\/[^\/]+\/?$/g,"");	
	},
	//检测是否为带协议的绝对路径 http://a.com
	isAP:function(path){
		return !!path.match(rePtl);
	}
};




var currentlyAddingScript;
//获取当前活动的正在执行的script标签的路径
var getInteractiveScriptPath = function (){
    if(doc.currentScript){
        return doc.currentScript.src;
    }else{
        //ie6-10 得到当前正在执行的script标签
        var scripts = doc.getElementsByTagName('script');
        for (var i = scripts.length - 1; i > -1; i--) {
            if (scripts[i].readyState === 'interactive') {
                return scripts[i].src;
            }
        }
        // chrome and firefox4以前的版本
        var stack;// = (new Error()).stack;
        try{
        	arguments.length(); //强制报错,以便捕获e.stack
		}catch(e){
			stack = e.stack || 
			(global.opera && ((e+"").match(/of linked script \S+/g) || []).join(" "));
        }
        stack = stack.split( /[@ ]/g).pop();//取得最后一行,最后一个空格或@之后的部分
		return stack.replace(/(:\d+)?:\d+(\s)?$/i, "");//去掉行号与或许存在的出错字符起始位置
    }

    return currentlyAddingScript && currentlyAddingScript.src;
};

var imPath = (function(){
	var imPath = getInteractiveScriptPath();// im.js路径

	if(!path.isAP(imPath)){
		var docPath = (location.href+"").replace(/(\?|#).*$/i,"");// 页面路径

		if(imPath.match(/^\/|\\/g)){
			docPath = path.hostRoot(docPath);
		}else{
			docPath = path.dirname(docPath.match(/\/|\\$/g) ? docPath+"i" : docPath);
		}
		imPath = docPath+"/"+imPath;
	}
	return imPath;
})();

var config = {
	path:imPath,
	tag:"?t="+(+new Date())
};

var setConfig = function(c){
	return mix(config, c||{});
};
/**
 * 模块类
 * @class Module
 * @param { String } file   模块文件完整路径
 * @param { String|Array } deps (Optional) 模块依赖其他模块，多个依赖可以是数组形式
 * @remark
 */
function Module(file, deps){
	var self = this;
	//模块路径
	self.file = file;
	//是否为打包模块
	self.pkg = 0;
	//模块状态
	self.state = LOADING;
	//对应的依赖模块
	self.deps = deps || [];
	//模块的工厂方法
	self.factory = ud;
	//模块导出时的数据
	self.exports = ud;
	//模块事件存储
	self._on = {};

	//事件绑定和群发
	self.on = function(name, fn){
		self._on[name] = self._on[name]||[];
		if(fn){
			self._on[name].push(fn);
		}else{
			if(!isNaN(name)){
				if(self.state < name){
					self.state = name;
				}
			}
			forEach(self._on[name], function(fn){
				fn.call(self);
			});
		}
	};

	//绑定一个compiling事件，触发时，开始加载依赖，完成后开始编译
	self.on(COMPILING, function(){
		var s = moduleManager.checkCycle(self.file);
		if(!s){//检测依赖是否有循环
			//加载依赖
			self.loadDeps(function(){
				self.compile.apply(self, arguments);
			});
		}
	});
}
//模块的静态方法
mix(Module.prototype,{
	load:function() {
		//通过script 加载模块
		var that = this;
		var onerror = function(e){
			//log("Imjs: load file "+that.file+" error! ","error");
			moduleManager.remove(that.file);
		};
		var head = doc.getElementsByTagName('head')[0] || doc.documentElement;
	    var script = doc.createElement('script');
	    script.type = 'text/javascript';
	    script.async = "async";
	    script.src = that.file;
	    script.onerror = onerror;
	    script.onload = script.onreadystatechange = function () {
	        if (/loaded|complete|undefined/.test(script.readyState)) {
	        	that.on(LOADED);
	            script && (script.onerror = script.onload = script.onreadystatechange = null);
	            head && script && script.parentNode && head.removeChild(script);
	            script = ud;
	        }
	    };
	    currentlyAddingScript = script;
	    head.insertBefore(script, head.firstChild);
	    currentlyAddingScript = ud;
	},
	//将工厂编译后存入模块exports
	compile:function(){
		var self = this
			,factory = self.factory;

		if(type(factory, "function")){
			self.exports = factory.apply({}, arguments);
		}else{
			self.exports = factory;
		}

		self.state = COMPILED;
		self.on(COMPILED);
	},
	//加载依赖模块
	loadDeps:function(fn){
		moduleManager.load(this.deps, fn);	
	}
});


//模块管理器
var moduleManager = {
	//缓存用于存放加载模块
	data:{},
	//设置一个模块
	set:function(id, mod){
		this.data[id] = mod;
	},
	//获取一个模块
	get:function(id){
		return this.data[id];
	},
	//删除一个模块
	remove:function(id){
		delete this.data[id];
	},
	//检测模块之间是否循环依赖
	checkCycle:function(id, stack){
		var that = this
			,deps
			,d
			,re = false
			,m = that.data[id];
			
		stack = stack || [];

		if(m){
			if(!type(m.deps, "array")){
				deps = [m.deps];
			}else{
				deps = m.deps;
			}
			deps = that.realpaths(deps);

			while(d = deps.shift()){
				if(indexOf(stack,d)==-1){
					stack.push(d);
					re = that.checkCycle(d, stack);
					if(re){
						return re;
					}else{
						stack.pop();
					}
				}else{
					stack.push(d);
					log("Circular dependencies:\r\n"+stack.join(" >>\r\n"),"error");
					return true;
				}
			}
		}
		return re;
	},
	//获得对应id模块的exports
	exports:function(ids){
		var that = this
			,re = [];

		forEach(ids, function(id){
			var m = that.get(id);
			re.push(m && m.exports);
		});
		return re;
	},
	//对应id模块是否都已经加载完成
	isOk:function(ids){
		var that = this
			,v = 1;

		forEach(ids, function(id){
			var mod = that.data[id];
			if(!mod || mod.state< COMPILED){
				v = 0;
			}
		});
		return v;
	},
	//id转换成对应的真实路径
	realpaths:function(ids){
		var nids = [];
		if(!type(ids,"array")){
			ids = [ids];
		}
		forEach(ids,function(id){
			id = trim(id);
			if(!path.isAP(id)){
				id = path.normalize(path.dirname(config.path)+"/"+id);
			}
			//为uri添加一个统一的后缀
			if(!/\.js$/.test(id)){
				id = id + ".js";
			}
			id = id + (config.tag||"");
			nids.push(id);
		});
		return nids;
	},
	//加载ids对应的模块
	load:function(ids, callback){
		var that = this
			,f = false;//防止回调函数被执行多次
		
		//为每个id转换成真实uri路径
		ids = that.realpaths(ids);
		//如果没有依赖
		if(ids.length==0){
			callback();
		}else{
			forEach(ids, function(id){
				var m = that.get(id);
				if(!m){
					m = new Module(id);
					m.on(SAVED, function(){
						m.on(COMPILING);
					});

					setTimeout(function(){
						//防止插入标签时阻塞onsave事件
						m.load();
					},1);
					that.set(id, m);
				}else{
					//对打包模块进行编译
					if(m.pkg && m.state<COMPILING){
						m.on(COMPILING);
					}
				}
				//如果模块状态进行中，绑定事件
				if(m.state<COMPILED){
					m.on(COMPILED, function(){
						//判断所有模块是否完成
						if(that.isOk(ids)){
							callback.apply(global, that.exports(ids));
						}
					});
				}else{
					//立即判断所有模块是否完成
					if(that.isOk(ids) && !f){
						f = true;
						callback.apply(global, that.exports(ids));
					}
				}
			});
		}
	}
};

/**
 * 定义一个模块
 * @method define
 * @static
 * @param { String|Array } deps (Optional)   模块依赖其他模块，多个依赖可以是数组形式
 * @param { Function|Object|String } factory    模块的工厂函数，必须要有返回值。与通常的闭包方式里的函数类似 (function(){})()，
 							传入的参数分别与 deps对应模块返回值对应
 * @example 
 * define(function(){
 * 		return "foo";
 * });
 * 或者
 * define(["aModule", "bModule"], function(a, b){
 *		return a+b;
 * });
 * @remark
 */
function define(deps, factory){
	var args = arguments
	,i = getInteractiveScriptPath()
	,d = []
	,f = noop;

	if(args.length==1){
		f = deps;
	}else{
		d = deps;
		f = factory;
	}

	var mod = moduleManager.get(i);
	if(mod){
		mod.deps = d;
		mod.factory = f;
		mod.on(SAVED);
	}else{
		log("Can't find module:"+i,"error");
	}
}

define.tmd = true;//Tiny Module Definition amd精简版
    
/**
 * 定义模块包 （主要用工具打包后的文件）
 * @method defines
 * @static
 * @param { Array } list  定义模块的一个包含对象的数组
 * @example 
 * defines([{
 * 		uri:"module",
 *      deps:[],
 *      function(){
 *         return "foo";
 *      }
 * }]);
 * @remark 用打包工具自动将多个模块文件合并生成调用defines的代码
 */
function defines(list){
	var modules = [];
	forEach(list, function(d){
		var id = moduleManager.realpaths(d.uri)[0];

		var m = new Module(id, d.deps);

		moduleManager.set(id,m);
		
		m.factory = d.factory;
		
		m.pkg = 1;//标记为打包模块
		
		m.on(SAVED);//只保存不编译，以后根据需要编译包内对应模块

	});

	//define(noop);//打包 本身是模块，触发包模块
}

/**
 * 获取一个模块
 * @method require
 * @static
 * @param { String|Array } ids  要请求的模块
 * @param { Function } callback   加载完成模块后的回调函数
 * @example 
 * require("a", function(a){
 * 		return "foo";
 * });
 */
function require(ids, callback){
	
	var args = arguments;

	if(args.length>1){

		moduleManager.load(ids||[], function(){
			
			(callback||noop).apply(this, arguments);

		});

	}else{
		if(type(ids, "array")||type(ids, "string")){
			
			moduleManager.load(ids, noop);

		}else if(type(ids,"function")){
			
			return ids();

		}
	}
}

mix(global,{
	 define:define
	,require:require
	,defines:defines
	,Im:{
		 modules:moduleManager.data
		,im:"1.3"
		,log:log
		,imPath:imPath
		,config:setConfig
	}
});

})(this);


}


