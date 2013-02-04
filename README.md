# Imjs
## A tiny javascript module loader

`im.js` is a simple solution to modular javascript development.

### Features
 * URI即Id模块不需声明别名
 * 多依赖支持
 * 模块并行加载

### How to use
文件foo.js  
define(function(){

  //定义模块  
  return "this is foo!"
  
});

require("foo",function(foo){

  //调用模块   
  alert(foo);
  
});


For more advanced usage check the [`test.html`](http://fengdi.github.com/imjs/test.html).

This software is released under the MIT license.
