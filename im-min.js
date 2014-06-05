//im.js v1.3 2014-06-05T22:01:55.156Z
(function(n){function r(b,c){var a=this;a.file=b;a.pkg=0;a.state=B;a.deps=c||[];a.factory=p;a.exports=p;a._on={};a.on=function(b,c){a._on[b]=a._on[b]||[];c?a._on[b].push(c):(!isNaN(b)&&a.state<b&&(a.state=b),h(a._on[b],function(b){b.call(a)}))};a.on(q,function(){e.checkCycle(a.file)||a.loadDeps(function(){a.compile.apply(a,arguments)})})}function z(b,c){var a=arguments,d=A(),y=[],f=s;1==a.length?f=b:(y=b,f=c);(a=e.get(d))?(a.deps=y,a.factory=f,a.on(t)):u("Can't find module:"+d,"error")}var p=void 0,
j=document,g=[],s=function(){},v=/^(\w+:\/\/\/?)(.*)/,B=1,t=2,q=4,h=g.forEach?function(b,c){b.forEach(c)}:function(b,c){for(var a=0,d=b.length;a<d;a++)c(b[a],a,b)},C=g.indexOf?function(b,c){return b.indexOf(c)}:function(b,c){for(var a=0,d=b.length;a<d;a++)if(c===b[a])return a;return-1},w=function(b,c){for(var a in c)b[a]=c[a];return b},k=function(b,c){var a={}.toString,a=null===b?"null":b===p&&"undefined"||a.call(b).slice(8,-1).toLowerCase();return c?a===c:a},u=function(b,c){if("console"in n)console[c||
"log"](b)},l={normalize:function(b){var c,a="";if(c=b.match(v))a=c[1],b=c[2];if(-1===b.indexOf("."))return a+b;c=b.split("/");var d=[];h(c,function(a){if(""!=a)if(".."===a){if(0===d.length)throw Error("The path is invalid: "+b);d.pop()}else"."!==a&&d.push(a)});return a+d.join("/").replace(":80/","/")},hostRoot:function(b){var c="",a="";if(b=b.match(v))c=b[1],a=b[2].split("/")[0];return c+a+"/"},dirname:function(b){return!b.match(/\//)?"./":b.replace(/\/[^\/]+\/?$/g,"")},isAP:function(b){return!!b.match(v)}},
A=function(){if(j.currentScript)return j.currentScript.src;for(var b=j.scripts||j.getElementsByTagName("script"),c=b.length-1;-1<c;c--)if("interactive"===b[c].readyState)return b[c].src;var a;try{arguments.length()}catch(d){a=d.stack||n.opera&&((d+"").match(/of linked script \S+/g)||[]).join(" ")}a=a.split(/[@ ]/g).pop();return a.replace(/(:\d+)?:\d+(\s)?$/i,"")},g=A();if(!l.isAP(g))var m=(location.href+"").replace(/(\?|#).*$/i,""),m=g.match(/^\/|\\/g)?l.hostRoot(m):l.dirname(m.match(/\/|\\$/g)?m+
"i":m),g=m+"/"+g;var x={path:g,tag:"?t="+ +new Date};w(r.prototype,{load:function(){var b=this,c=j.getElementsByTagName("head")[0]||j.documentElement,a=j.createElement("script");a.type="text/javascript";a.async="async";a.src=b.file;a.onerror=function(){e.remove(b.file)};a.onload=a.onreadystatechange=function(){/loaded|complete|undefined/.test(a.readyState)&&(b.on(3),a&&(a.onerror=a.onload=a.onreadystatechange=null),c&&a&&a.parentNode&&c.removeChild(a),a=p)};c.insertBefore(a,c.firstChild)},compile:function(){var b=
this.factory;this.exports=k(b,"function")?b.apply({},arguments):b;this.state=5;this.on(5)},loadDeps:function(b){e.load(this.deps,b)}});var e={data:{},set:function(b,c){this.data[b]=c},get:function(b){return this.data[b]},remove:function(b){delete this.data[b]},checkCycle:function(b,c){var a,d,e=!1;a=this.data[b];c=c||[];if(a){a=k(a.deps,"array")?a.deps:[a.deps];for(a=this.realpaths(a);d=a.shift();)if(-1==C(c,d))if(c.push(d),e=this.checkCycle(d,c))break;else c.pop();else return c.push(d),u("Circular dependencies:\r\n"+
c.join(" >>\r\n"),"error"),!0}return e},exports:function(b){var c=this,a=[];h(b,function(b){b=c.get(b);a.push(b&&b.exports)});return a},isOk:function(b){var c=this,a=1;h(b,function(b){b=c.data[b];if(!b||5>b.state)a=0});return a},realpaths:function(b){var c=[];k(b,"array")||(b=[b]);h(b,function(a){a=(a||"").replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g,"");l.isAP(a)||(a=l.normalize(l.dirname(x.path)+"/"+a));/\.js$/.test(a)||(a+=".js");a+=x.tag||"";c.push(a)});return c},load:function(b,c){var a=this,d=!1;
b=a.realpaths(b);0==b.length?c():h(b,function(e){var f=a.get(e);if(f){if(f.pkg&&f.state<q)f.on(q)}else f=new r(e),f.on(t,function(){f.on(q)}),setTimeout(function(){f.load()},1),a.set(e,f);if(5>f.state)f.on(5,function(){a.isOk(b)&&c.apply(n,a.exports(b))});else a.isOk(b)&&!d&&(d=!0,c.apply(n,a.exports(b)))})}};z.tmd=!0;w(n,{define:z,require:function(b,c){if(1<arguments.length)e.load(b||[],function(){(c||s).apply(this,arguments)});else if(k(b,"array")||k(b,"string"))e.load(b,s);else if(k(b,"function"))return b()},
defines:function(b){h(b,function(b){var a=e.realpaths(b.uri)[0],d=new r(a,b.deps);e.set(a,d);d.factory=b.factory;d.pkg=1;d.on(t)})},Im:{modules:e.data,im:"1.3",log:u,imPath:g,config:function(b){return w(x,b||{})}}})})(this);
