//1
require("test/d",function(d){

  test( "module d", function() {
    ok( d == "d !", "Passed!" );
  });

});

//2
require("test/a",function(a){

  test( "module a", function() {
    ok( a == "a b c d !", "Passed!" );
  });
  
});

//3
//再次请求
require("test/a",function(a){

  test( "re module a", function() {
    ok( a == "a b c d !", "Passed!" );
  });

});

//4
require(["test/a", "test/b", "test/c", "test/d"],function(a, b, c, d){

  test( "module a,b,c,d", function() {
    ok( a == "a b c d !", "Passed!" );
    ok( b == "b c d !", "Passed!" );
    ok( c == "c d !", "Passed!" );
    ok( d == "d !", "Passed!" );
  });

});

//5
//循环依赖检测
require("test/cycle/a",function(a){
  throw new Error("cycle");
  test( "cycle ", function() {
     throws(
      function() {
        throw "error"
      },
      "cycle be run！"
    );
  });

});

//6
require("test/string",function(a){
  
  test( "module string", function() {
    ok( a == "hello string module!", "Passed!" );
  });

});

//7
require("test/number",function(a){
  
  test( "module number", function() {
    ok( a == 520, "Passed!" );
  });

});

//8
require("test/object",function(a){
  
  test( "module object", function() {
    ok( a.f() == "bar", "Passed!" );
  });

});

//9
require("modules/jquery",function(a){
  test( "module jquery", function() {
    ok( typeof a != 'undefined', "Passed!" );
  });

});

//10
require("test/repeat/a",function(a){
  test( "module repeat", function() {
    ok( a == 'this is Rthis is R', "Passed!" );
  });

});

//11
require("test/not-amd",function(){
  
  test( "not-amd module", function() {
    ok( noAMD == true, "Passed!" );
    ok( show() == "NotAMD", "Passed!" );
  });

});

//12
require("test/merge/a",function(a){
  
  test( "module merge", function() {
    ok( a == 'this is DD', "Passed!" );
  });

});

//13
require("test/404",function(f){
  //请求错误链接

  test( "404 ", function() {
  
     throw new Error("404");
     throws(
      function() {
        throw "error"
      },
      "404 be run！"
    );
    
  });
  
  
});

