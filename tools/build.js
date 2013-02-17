var fs = require("fs");
var path = require("path");
//var uglify = require("uglify-js");
var exec = require('child_process').exec;
var build = require("./build.json");



/*
* 通过路径获取jsonObject对象的某个值
* @param {object} obj  json对象   {"a":{"c":["foo","bar"]}}
* @param {String} path  路径   "a.c.1"
* @return {Mix}
*/
function get_value(obj, path){
  (path+"").replace(/[^.]+/g,function(n){
    obj = (obj!=void 0 && typeof obj=="object" && n in obj) ? obj[n] : void 0;
  });
  return obj;
}
/*
* 微型模版引擎
* @param {String} str  模板   {#{foo}#}
* @param {object} data  json对象    {"foo":"bar"}
* @return {String} 输出字符串
*/
function tpl(str, data){
	return str.replace(/\{#\{([^}#]*)\}#\}/g, function (m, s) {
	        return get_value(data, s);
	});
}


//
var operate = {
	/*
	* uglify-js压缩文件
	*/
	minify:function(file,callback){
		var code = uglify.minify(file).code;
		callback(code);
	},
	/*
	* 合并文件
	*/
	merge:function(file,callback){
		var code = "";

		if(({}).toString.call(file) != "[object Array]"){
			file = [file];
		}

		file.forEach(function(file){
			code = code + fs.readFileSync(file);
		});
		callback(code);
	},
	/*
	* gcc压缩文件
	*/
	gcc:function(file,callback){
		var cmd = "java -jar compiler.jar ";

		if(({}).toString.call(file) != "[object Array]"){
			file = [file];
		}

		var list = file.join(" --js=");

    	exec(cmd+list,function(error, stdout, stderr){
    		if (!error) {
    			callback(stdout);
    		}else{
    			console.log(error);
    		}
    	});
	}
}

build['var'] = build['var']||{};

build.process.forEach(function(process){

	var files = process.from;

	var prepend = process.prepend || "";//文件头插入内容

	operate[process.operate](files,function(code){
  		
    	build['var'].dateTime = (new Date()).toJSON();
  		
  		code = prepend + code;
    
		code = tpl(code, build['var']);
    
		console.log("write: "+process.out);
		
		fs.writeFileSync(process.out, code);

	});
	
});










