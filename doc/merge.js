;defines([{"uri":"test/d.js","deps":"test/a.js","factory":function (){

  var s = "d !"
  return s;
}},{"uri":"test/b.js","deps":["test/c.js"],"factory":function (c){
  //模块依赖c模块
  
	return "b "+c;
}},{"uri":"test/a.js","deps":["test/b.js"],"factory":function (c){
  //模块依赖b模块
  
	return "a "+c;
}}]);