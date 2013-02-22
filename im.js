// A tiny javascript module loader for the Web
// v1.1 | MIT Licensed

(function(global){
var ud = void 0;
var doc = document;
var epa = [];
var slice = epa.slice;
var forEach = epa.forEach ?
function(arr, fn) {
  arr.forEach(fn);
} :
function(arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn(arr[i], i, arr);
  }
};
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

var noop = function(){};
var trim =  function( text ) {
	return (text || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "" );
};
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
var log = function(s,t){
	t = t || 'log';
	if('console' in global){
		console[t](s);
	}
};

var path = {
	normalize : function (path) {
		var protocol = "";
		path = path.replace(/^\w+:\/\/\/?/,function(p){
			protocol = p;
			return "";
		});
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
	dirname:function(path){
		if(!path.match(/\//)){
			return path = "./";
		}
		return path.replace(/\/[^\/]+\/?$/g,"");	
	},
	//检测是否为带协议的绝对路径 http://a.com
	isAP:function(path){
		return !!path.match(/^\w+:\/\//);
	}
};

var LOADING = 1,   // loading
  SAVED = 2,     // saved
  LOADED = 3,    // ready
  COMPILING = 4, // compiling
  COMPILED = 5;   // available

var config = {
	tag:"?t="+(+new Date())
};
var setConfig = function(c){
	return mix(config, c||{});
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

var imPath = getInteractiveScriptPath();// im.js路径
var docPath = (location.href+"").replace(/(\?|#).*$/i,"");// 页面路径
docPath = docPath.match(/\/|\\$/g) ? docPath+"i" : docPath; //路径为/结尾时的处理
imPath = path.isAP(imPath) ? imPath : path.dirname(docPath)+"/"+imPath;//im.js完整路径

//定义模块对象
function Module(file, deps){
	var self = this;
	//模块路径
	self.file = file;
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
			forEach(self._on[name], function(fn){
				fn.call(self);
			});
		}
	};

	self.on("load", function(){
		if(self.state < LOADED){
			self.state = LOADED;
		}
	});
	self.on("save", function(){
		self.state = SAVED;
		moduleManager.checkCycle(self.file);//检测依赖是否有循环
		//加载依赖
		self.loadDeps(function(){
			self.state = COMPILING;
			self.compile.apply(self, arguments);
		});
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
	        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
	        	that.on("load");
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
		self.on("compile");
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
			,m = that.data[id];
			
		stack = stack || [];

		if(m){
			if(!type(m.deps,"array")){
				deps = [m.deps];
			}else{
				deps = m.deps;
			}
			deps = that.realpaths(deps);
			forEach(deps, function(d){
				if(indexOf(stack,d)==-1){
					stack.push(d);
					that.checkCycle(d, stack);
				}else{
					stack.push(stack[0]);
					log("Circular dependencies:\r\n"+stack.join(" >>\r\n"),"error")
				}
			});
		}
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
				id = path.normalize(path.dirname(imPath)+"/"+id);
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
			forEach(ids,function(id){
				var m = that.get(id);
				if(!m){
					m = new Module(id);
					setTimeout(function(){
						//防止插入标签时阻塞onsave事件
						m.load();
					},1);
					that.set(id, m);
				}
				//如果模块状态进行中，绑定事件
				if(m.state<5){
					m.on("compile", function(){
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

//API 定义一个模块
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
		mod.on("save");
	}else{
		log("Can't find module:"+i,"error");
	}
}
//API 定义模块包
//[{uri,deps,factory},]
function defines(list){
	var modules = [];
	forEach(list,function(d){
		var id = moduleManager.realpaths(d.uri)[0];
		var m = new Module(id);
		moduleManager.set(id,m);
		m.deps = d.deps||[];
		m.factory = d.factory;
		modules.push(m);
	});
	forEach(modules,function(m){
		if(m.state < SAVED){
			m.on("save");
		}
	});
}

//API 获取一个模块
function require(deps, callback){
	var args = arguments;
	if(args.length>1){
		moduleManager.load(deps||[],function(){
			(callback||noop).apply(this, arguments);
		});
	}else{
		if(type(deps,"array")||type(deps,"string")){
			moduleManager.load(deps||[],noop);
		}else if(type(deps,"function")){
			return deps();
		}
	}
}

mix(global,{
	 define:define
	,require:require
	,defines:defines
	,Im:{
		 modules:moduleManager.data
		,im:"1.1"
		,log:log
		,config:setConfig
	}
});

})(this);
