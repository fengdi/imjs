//这是 a
define(["test/b.js", "modules/sizzle"], function(c, $){
	//模块依赖b模块
	var h4 = $("h4")[0];

	return h4.innerHTML+" a "+c;
});