
# ![Imjs](http://img03.taobaocdn.com/imgextra/i3/583325539/TB2cJmTXFXXXXbsXpXXXXXXXXXX-583325539.png)  v1.3

## A tiny javascript module loader

`im.js` is a simple solution to modular javascript development.

Only 2.3 KB gzipped (4.3 KB minified)

### Features
 * 符合AMD的匿名模块规范,不需声明别名
 * 支持模块缓存，不需多次请求
 * 模块多依赖支持
 * 多模块并行加载（仅支持并行加载）
 * 支持对模块循环依赖关系检测
 * 支持模块合并，im-dev.js版同时有模块加载和模块合并功能
 * 路径保持简单，约定模块路径都相对于Im.js路径或者是带域名的绝对的地址

### How to use

#### 1.简单上手 ####

定义模块 foo.js:

    define(function(){

        //在模块内实现一些功能（函数、类、甚至库等）, 最后返回 
        return "this is foo!";
  
    });

调用 foo.js 模块：

    require("foo",function(foo){

	   //foo模块的返回值会当参数传入
       
       alert(foo);//调用模块返回的值
  
    });



#### 2.模块依赖关系 ####

定义模块 bar.js （需要依赖foo.js）

    define(['foo'], function(foo){
	    return {
			name:foo, //来自模块foo的返回值
			showName:function(){
				alert(this.name);
			}
		};
    });

调用 bar.js 模块：

	require("bar",function(bar){
	   bar.showName();
    });

这里require模块bar时，

依赖顺序为: 入口 => bar => foo

执行顺序为: foo => bar => 入口

当大规模开发时，模块就可能有很多，依赖关系复杂，而Im.js就是用来管理这些模块的。


下图是实际开发中可能出现的关系图：

![](http://img03.taobaocdn.com/imgextra/i3/583325539/TB2iIsqXXXXXXamXFXXXXXXXXXX-583325539.jpg)

其中合法的依赖关系为：

0 -> 1 -> 2 -> 4

0 -> 1 -> 3 -> 4

0 -> 1 -> 5 -> 6

出现循环的关系是：

0 -> 1 -> 7 -> 8 -> 9 -> 1 这是不合法的，Im.js会检测出循环依赖并报错。

----------
For more advanced usage check the [`快速上手`](http://fengdi.github.com/imjs/test.html)、
[`模块合并`](https://github.com/fengdi/imjs/wiki/%E6%A8%A1%E5%9D%97%E5%90%88%E5%B9%B6%E5%8A%9F%E8%83%BD%E8%AF%B4%E6%98%8E).

This software is released under the MIT license.
