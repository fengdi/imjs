# ![Imjs](http://img03.taobaocdn.com/imgextra/i3/583325539/TB2cJmTXFXXXXbsXpXXXXXXXXXX-583325539.png) v2.0

## A tiny Promise based javascript module loader

### Features ##

非常轻量级，minify 文件大小 2.3KB，gzip 传输大小 1.3KB

支持 AMD 模块，并且 require 的 API 已 Promise 化


### How to use ###

定义模块一个 AMD 规范的模块 hello.js:

```javascript
define([], function() {
    //在模块内实现一些功能（函数、类、甚至库等）, 最后返回
    return "hello world";
});
```

你可以像 [requirejs](https://requirejs.org/) 一样调用 hello.js 模块：

```javascript
require("hello", function(hello) {
    //hello模块的返回值会当参数传入

    alert(hello); //调用模块返回的值
});
```

你也可以用 ES6 的 async/await 方式调用 hello.js 模块：

```javascript
(async () => {
    let hello = await require("hello");
    alert(hello);
})();
```

你可以在定义的 AMD 模块中使用 require

```javascript
define(async function() {
    let hello = await require("hello");
    //let a = await require("a");
    //let b = await require("b");
    //多个依赖模块
    //let deps = await Promise.all([
    //  require('hello'), require('a'), require('b')  //...
    //]);
    return hello.toUpperCase();
});
```

调用非AMD模块时，可以用hook方式解决模块导出问题

```javascript
//比如加载使用jquery
//先将jquery文件放入./lib/jquery.js

//然后定义一个hook
require.setHook("./lib/jquery", () => {
    return window.$;
});

//再调用模块
require("./lib/jquery", function($) {
    $("#id").css({ color: red });
});
```

### 配置项 ###

`cwd` 工作目录

```javascript
//当前工作目录
require.cwd = "./assets/js";
//一旦配置了cwd
//你可以用@代替工作路径
define(["@/a.js"], function(a) {
    //a 来自 ./assets/js/a.js
});
```

`default` 默认文件

```javascript
//路径指定的如果是目录，默认指定的目录下的文件名
require.default = "index.js";

//定位到目录
define(["assets/lib/"], function(lib) {
    //lib 来自 ./assets/js/index.js
});
```

`tag` 缓存版本标签

```javascript
//模块路径统一加入tag标签
require.tag = "v=1.0.1";

define(["assets/test"], function(test) {
    //test 请求路径为 assets/test.js?v=1.0.1
});
```

除此之外你可以在 html 里引入`im.js`的 script 标签上进行配置：

```html
<script
    src="assets/js/im.js"
    data-cwd="assets/js"
    data-default="index.js"
    data-tag="1.0.1"
    data-main="app.js"
></script>

<!-- 
    data-main为配置的入口js文件，
    会自动引入执行，相当于:
    require('app.js');
 -->
```
