# Imjs
## A tiny javascript module loader

`im.js` is a simple solution to modular javascript development.

### Features
 * 简单的API
 * URI即Id
 * 异步多线程调用

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


For more advanced usage check the [`test.html`](https://github.com/fengdi/).

This software is released under the MIT license.
