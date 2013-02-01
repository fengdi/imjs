// A Module Loader for the Web
// v1.0 | MIT Licensed

(function(global){
var undefined = void 0;
var slice = [].slice;
var forEach = [].forEach ?
function(arr, fn) {
  arr.forEach(fn);
} :
function(arr, fn) {
  for (var i = 0, len = arr.length; i < len; i++) {
    fn(arr[i], i, arr);
  }
};
var trim =  function( text ) {
	return (text || "").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "" );
};
var mix = function(a, b){
	for (var k in b) {
		a[k] = b[k];
	}
	return a;
};

/**
 * 类型判断
 * @param {*} obj
 * @param {string= } type
 */
var type = function(obj, type) {
	var ts = {}.toString,
		_types = {
		    'undefined' : 'undefined',
		    'number' : 'number',
		    'boolean' : 'boolean',
		    'string' : 'string'
		},
		t = obj===null ? 'null' :
		(_types[typeof obj] || ts.call(obj).slice(8,-1).toLowerCase());
	return type ? t===type : t;
}

var log = function(s,t){
	t = t || 'log';
	if('console' in global){
		console[t](s);
	}
};

var path = {
	normalize : function (path) {
		var protocol = "";
		path = path.replace(/^\w+\:\/\/\/?/,function(p){
			protocol = p;
			return "";
		});

		if (path.indexOf(".") === -1) {
			return protocol + path;
		}
		var original = path.split("/");
		var ret = [], part;

		for (var i = 0; i < original.length; i++) {
			part = original[i];
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
		}
		return protocol + ret.join("/").replace(":80/", "/");;
	},
	dirname:function(path){
		if(!path.match(/\//)){
			return path = "./";
		}
		return path.replace(/\/[^\/]+\/?$/g,"");	
	},
	basename:function(path, ext){
		var m;
		var e = new RegExp((ext||"")+"$");
		if(m = path.match(/([^\/]+\/?)$/)){
			return m[0].replace(e,"");
		}
	},
	//检测是否为带协议的绝对路径 http://a.com
	isAP:function(path){
		return !!path.match(/^\w+\:\/\//);
	}
};

var STATUS = {
  LOADING: 1,   // loading
  SAVED: 2,     // saved
  LOADED: 3,    // ready
  COMPILING: 4, // compiling
  COMPILED: 5   // available
};

var config = {
	tag:"?t="+(+new Date())
};
var setConfig = function(c){
	return mix(config,c||{});
}

//获取当前活动的正在执行的script标签的路径
var getInteractiveScriptPath = function (){
	var doc = document;
    if(doc.currentScript){
        return doc.currentScript.src;
    } else if (doc.attachEvent) {
        //ie6-9 得到当前正在执行的script标签
        var scripts = doc.getElementsByTagName('script');
        for (var i = scripts.length - 1; i > -1; i--) {
            if (scripts[i].readyState === 'interactive') {
                return scripts[i].src;
            }
        }
    } else {
        // chrome and firefox4以前的版本
        var stack = (new Error()).stack || "";
        // chrome uses at, Op ff uses @
        var e = stack.indexOf('@') !== -1 ? '@' : ' at ' ;
        while (stack.indexOf(e) !== -1) {
            stack = stack.substring(stack.indexOf(e) + e.length);
        }
        stack = stack.replace(/\:\d+\:\d+$/mig, "");
        stack = stack.replace(/\:\d+$/mg, "");
        stack = trim(stack);
        return stack;
    }
    return "";
};

var imPath = getInteractiveScriptPath();
var docPath = (location.href+"").replace(/(\?|#).*$/i,"");
imPath = path.isAP(imPath) ? imPath : path.dirname(docPath)+"/"+imPath;
var im = "1.0";

//定义模块对象
function Module(file, deps){
	var self = this;
	//模块路径
	self.file = file;
	//模块状态
	self.state = 1;
	//对应的依赖模块
	self.dependencies = deps || [];
	//模块的工厂方法
	self.factory = undefined;
	//模块导出时的数据
	self.exports = null;
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
		self.state = STATUS.LOADED;
		//加载依赖
		self.loadDependencies(function(){
			self.state = STATUS.COMPILING;
			self.compile.apply(self, slice.call(arguments));
		});

	});

	self.loadScript();
}
//定模块的静态方法
mix(Module.prototype,{
	loadScript:function() {
		//通过script 加载模块
		var doc = document;
		var that = this;
		var onerror = function(e){
			log("Imjs: load file "+that.file+" error! ","error");
			moduleManager.remove(that.file);
		};
		var head = doc.getElementsByTagName('head')[0] || doc.documentElement;
	    var script = doc.createElement('script');
	    script.type = 'text/javascript';
	    script.async = "async";
	    script.src = this.file;
	    script.onerror = onerror;
	    script.onload = script.onreadystatechange = function () {
	        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
	        	that.on("load");
	            script && (script.onerror = script.onload = script.onreadystatechange = null);
	            head && script.parentNode && head.removeChild(script);
	            script = undefined;
	        }
	    };
	    head.insertBefore(script, head.firstChild);
	},
	//将工厂编译后存入模块exports
	compile:function(){
		var factory = this.factory;
		if(type(factory, "function")){
			this.exports = factory.apply(this,slice.call(arguments));
		}else{
			this.exports = factory;
		}
		
		this.state = STATUS.COMPILED;
		this.on("compile");
	},
	//加载依赖模块
	loadDependencies:function(fn){
		moduleManager.load(this.dependencies, fn);	
	}
});


//模块管理器
var moduleManager = {
	//缓存用于存放加载模块
	data:{},
	//设置一个模块
	set:function(id,mod){
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
	//获得对应id模块的exports
	exports:function(ids){
		var that = this;
		ids = that.realpaths(ids);
		var re = [];
		forEach(ids,function(id){
			var m = that.get(id);
			re.push(m && m.exports);
		});
		return re;
	},
	//获得对应id模块的状态
	states:function(ids){
		var mod,that = this,states = [];
		ids = that.realpaths(ids);

		forEach(ids,function(id){
			mod = that.data[id];
			if(!mod){
				states.push(0);
			}else{
				states.push(mod.state);
			}
		});
		return states;
	},
	//对应id模块是否都已经加载完成
	isComplete:function(ids){
		var that = this;
		var v = 1;
		//ids = that.realpaths(ids);
		forEach(ids,function(id){
			var mod = that.data[id];
			if(!mod || mod.state< STATUS.COMPILED){
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
			nids.push(id);
		});
		return nids;
	},
	//加载ids对应的模块
	load:function(ids, callback){
		var that = this;
		//为每个id转换成真实uri路径

		ids = that.realpaths(ids);

		//为uri添加一个统一的后缀
		forEach(ids,function(id,i){
			if(!/\.js$/.test(id)){
				id = id + ".js";
			}

			ids[i] = id +  "" + config.tag;
		});

		//如果没有依赖
		if(ids.length==0){
			callback();
		}else{
			forEach(ids,function(id){
				var m = that.get(id);
				if(!m){
					m = new Module(id);
					that.set(id, m);
				}
				//如果模块状态进行中，绑定事件
				if(m.state<5){
					m.on("compile", function(){
						//判断所有模块是否完成
						if(that.isComplete(ids)){
							callback.apply(null, that.exports(ids));
						}
					});
				}else{
					//立即判断所有模块是否完成
					if(that.isComplete(ids)){
						callback.apply(null, that.exports(ids));
					}
				}
			});
		}
	}
};

//API 定义一个模块
function define(deps, factory){
	var ps = getInteractiveScriptPath();
	var mod = moduleManager.get(ps);
	var args = arguments;

	if(mod){
		if(args.length==1 && type(deps,"function")){
			factory = deps;
			mod.dependencies = [];
		}else{
			mod.dependencies = deps||[];
		}

		mod.factory = factory;
		mod.state = STATUS.SAVED;
		mod.on("save");
	}
}

//API 获取一个模块
function require(deps, callback){
	var args = arguments;
	if(args.length>1){
		moduleManager.load(deps||[],function(){
			callback.apply(this, slice.call(arguments));
		});
	}else{
		if(type(deps,"function")){
			deps();
		}
	}
}

global.define = define;
global.require = require;
global.Im = {
	modules:moduleManager.data,
	im:im,
	config:setConfig
};

})(this);
