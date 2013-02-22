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
		/**
	     * 创建一个类  混合构造函数/原型方式.
	     *
	     * @param {Object} data 定义类成员的对象
	     * @return {Function(Class)} 返回创建的类
	     * @doc
	     */
		create: function(data) {
			var obj = data.__ || function(){};
			//过滤构造方法和原型方法
			delete data.__;
			this.include(obj, data);

			//添加父类属性
			obj.$super = createObject({}, Object); 
			
			return obj;
		},
		/**
	     * 继承  混合对象冒充原型链方式.
	     *
	     * @param {Function(Class)} source 父类
	     * @param {Object} [extd] 定义类成员的对象
	     * @param {Boolean} [execsuperc] 当子类被实例化时是否先执行父类构造函数
	     * @return {Function(Class)} 返回创建的子类
	     * @doc
	     */
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

			//维持原型链
			exobj.prototype = createObject(source.prototype, exobj);
			//原型扩展
			this.include(exobj, source.prototype);
			this.include(exobj, extd);

			//添加父类属性
			exobj.$super = createObject(source.prototype, source);
			return exobj;
		},
		/**
	     * 原型成员扩展.
	     *
	     * @param {Function(Class)} target 需要被原型拓展的类
	     * @param {Object} [ptys] 定义原型成员的对象
	     * @return {Function(Class)} 返回被拓展的类
	     * @doc
	     */
		include:function(target, ptys){
			if(!isFun(target)){target = function(){};}
			if(isObj(ptys)){
				mix(target.prototype, ptys);
			}
			return target;
		}
	};

	return $Class;
});
