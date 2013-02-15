define("hello", function(str){

  function sethtml(){

    var elem = document.getElementById("code_ddd");

    elem.innerHTML = str;

    return elem;

  }

  return sethtml;  //将这个方法返回
});