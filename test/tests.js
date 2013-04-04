require("test/d",function(d){

  test( "module d", function() {
    ok( d == "d !", "Passed!" );
  });

});


require("test/a",function(a){

  test( "module a", function() {
    ok( a == "a b c d !", "Passed!" );
  });
  
});

//再次请求
require("test/a",function(a){

  test( "re module a", function() {
    ok( a == "a b c d !", "Passed!" );
  });

});

require(["test/a", "test/b", "test/c", "test/d"],function(a, b, c, d){

  test( "module a,b,c,d", function() {
    ok( a == "a b c d !", "Passed!" );
    ok( b == "b c d !", "Passed!" );
    ok( c == "c d !", "Passed!" );
    ok( d == "d !", "Passed!" );
  });

});


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

require("test/string",function(a){
  
  test( "module string", function() {
    ok( a == "hello string module!", "Passed!" );
  });

});
require("test/number",function(a){
  
  test( "module number", function() {
    ok( a == 520, "Passed!" );
  });

});

require("test/object",function(a){
  
  test( "module object", function() {
    ok( a.f() == "bar", "Passed!" );
  });

});

require("modules/jquery",function(a){
  test( "module jquery", function() {
    ok( typeof a != 'undefined', "Passed!" );
  });

});

require("test/repeat/a",function(a){
  test( "module repeat", function() {
    ok( a == 'this is Rthis is R', "Passed!" );
  });

});


require("test/merge/a",function(a){
  
  test( "module merge", function() {
    ok( a == 'this is DD', "Passed!" );
  });

});


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

