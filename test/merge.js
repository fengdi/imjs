;defines([{"uri":"test/d.js","deps":[],"factory":function (){

  var s = "d !"

  return s;
}},{"uri":"test/c.js","deps":"test/d.js","factory":function (d){
  //模块依赖d模块

	return "c " + d;
}},{"uri":"test/b.js","deps":["test/c.js"],"factory":function (c){
  //模块依赖c模块
  
	return "b "+c;
}},{"uri":"test/a.js","deps":"test/b.js","factory":function (c){
	
	return "a "+c;
}}]);