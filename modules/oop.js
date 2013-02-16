// OOP class.js 1.3.0
// author Tangoboy
// http://www.cnblogs.com/tangoboy/archive/2010/08/03/1790412.html
// Dual licensed under the MIT or GPL Version 2 licenses.

define(function(){

	var opt = Object.prototype.toString,
	isFun = function(f){return opt.call(f)==="[object Function]"},
	isObj = function(o){return opt.call(o)==="[object Object]"};

	function createObject(proto, constructor) {
		var newProto,
			noop = function(){};
		if (Object.create) {
			newProto = Object.create(proto);
		} else {
			noop.prototype = proto;
			newProto = new noop();
		}
		newProto.constructor = constructor;
		return newProto;
	}

	function mix(r, s) {
		for (var i in s) {
			r[i] = s[i];
		}
		return r;
	}

	var $Class = {
		//创建一个类  混合构造函数/原型方式
		create: function(data) {
			var obj = data.__ || function(){};
			//过滤构造方法和原型方法
			delete data.__;
			this.include(obj, data);
			obj.$super = createObject({}, obj);
			return obj;
		},
		//继承  混合对象冒充原型链
		inherit:function(source, extd, execsuperc) {
			if(!isFun(source))return;
			execsuperc = execsuperc===false ? false : true;
			var obj = extd.__ || function(){};
			//过滤构造方法和原型方法
			delete extd.__;
			//对象冒充
			var exobj = execsuperc ? function(){
				source.apply(this,arguments);
				obj.apply(this,arguments);
			} : function(){
				obj.apply(this,arguments);
			};
			//原型链
			exobj.prototype = createObject(source.prototype, exobj);
			//原型扩展
			this.include(exobj, source.prototype);
			this.include(exobj, extd);
			exobj.$super = createObject(source.prototype, source);
			return exobj;
		},
		//原型扩展
		include:function(target, ptys){
			if(!isFun(target)){target = function(){};}
			if(isObj(ptys)){
				mix(target.prototype, ptys);
			}
			return target;
		}// ,
		// isinheritof:function(src, re){
		// 	while(src.super)
		// }
	};

	return $Class;
});
