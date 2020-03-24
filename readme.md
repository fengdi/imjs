
# ![Imjs](http://img03.taobaocdn.com/imgextra/i3/583325539/TB2cJmTXFXXXXbsXpXXXXXXXXXX-583325539.png)  v2.0

## A tiny Promise based javascript module loader


### Features

非常轻量级，minify文件大小2.3KB，gzip传输大小1.3KB

支持AMD模块，并且require的API已Promise化

### How to use

定义模块一个AMD规范的模块 hello.js:
```javascript
    define([], function(){

        //在模块内实现一些功能（函数、类、甚至库等）, 最后返回 
        return "hello world";
  
    });
```

你可以像[requirejs](https://requirejs.org/)一样调用 hello.js 模块：

```javascript
    require("hello",function(hello){

	   //hello模块的返回值会当参数传入
       
       alert(hello);//调用模块返回的值
  
    });
```

你也可以用ES6的 async/await 方式调用 hello.js 模块：

```javascript
    (async()=>{
        let hello = await require("hello");
        alert(hello);
    })();
```

非AMD可以用hook方式

```javascript
    //先定义一个hook
    require.setHook('./lib/jquery', ()=>{
        return window.$;
    })
    
    //再调用模块
    require("./lib/jquery", function($){
        $('#id').css({color:red});
    });
```