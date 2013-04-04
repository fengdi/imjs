# Imjs v1.2
## A tiny javascript module loader

`im.js` is a simple solution to modular javascript development.

Only 2.3 KB gzipped (4.3 KB minified)

### Features
 * URI即模块Id,不需声明别名
 * 支持模块缓存，不需多次请求
 * 模块多依赖支持
 * 多模块并行加载（仅支持并行加载）
 * 支持对模块循环依赖关系检测
 * 支持模块合并，im-dev.js版同时有模块加载和模块合并功能
 * 路径保持简单，约定模块路径都相对于Im.js路径

### How to use
文件foo.js:

    define(function(){

        //在模块内实现一些功能（函数、类、甚至库等）, 最后返回 
        return "this is foo!";
  
    });

调用foo模块：

    require("foo",function(foo){

       //调用模块返回的值
       alert(foo);
  
    });


For more advanced usage check the [`快速上手`](http://fengdi.github.com/imjs/test.html)、
[`模块合并`](https://github.com/fengdi/imjs/wiki/%E6%A8%A1%E5%9D%97%E5%90%88%E5%B9%B6%E5%8A%9F%E8%83%BD%E8%AF%B4%E6%98%8E).

This software is released under the MIT license.
