!function(e,r){"object"==typeof exports&&"undefined"!=typeof module?r():"function"==typeof define&&define.amd?define(r):r()}(0,function(){var e,r,t,n,o,i,c,u,f,a,s;e=window,r={}.toString,t=function(e){return"[object Function]"===r.call(e)},n=document,o=n.getElementsByTagName("head")[0]||n.documentElement,i=function(e){return/^(?:\/|\w+:)/.test(e)},c=function(e){return e.match(/\//)?e.replace(/\/[^\/]+?$/g,"/"):"./"},u=function(e,r){return function(e){var r=(e=e.replace(/\\/g,"/").replace(/\/{2,}/g,"/")).split("/"),t=i(e),n="";t&&(n=r.shift()+"//");for(var o=0;o<r.length;)".."===r[o]?o>0&&".."!==r[o-1]?r.splice(--o,2):t?r.splice(o,1):++o:"."===r[o]?r.splice(o,1):++o;return n+r.join("/")}(e+"/"+(r=/\.js$/.test(r)?r:r+".js"))},f={},s=function(r,a){try{function l(r){var n=r.deps;void 0===n&&(n=[]);var o=r.factory;if("export"in r)return r.export;var i=o.apply;return Promise.resolve(Promise.all(n.map(function(e){return s(u(c(r.path),e))}))).then(function(n){return r.export=i.call(o,e,n||[]),t(a)&&a(r.export),r.export})}r=i(r)?r:u(s.root,r);var d=f[r];return Promise.resolve(d?l(d):Promise.resolve((p=r,new Promise(function(e,r){var t=n.createElement("script");t.addEventListener("load",function(r){e(f[p])},{once:!0}),t.addEventListener("error",function(e){r("Not Found Module: "+p)},{once:!0}),t.$imId=p,t.src=p.trim(),o.insertBefore(t,o.firstChild)}))).then(l))}catch(e){return Promise.reject(e)}var p},(a=function(e,r,t){var o,i,c,u,a,s,l=arguments,d=n.currentScript,p=d&&d.$imId,m=d&&d.src;if(1==l.length)u=(o=[p,[],e])[0],a=o[1],s=o[2];else if(2==l.length)u=(i=[p,e,r])[0],a=i[1],s=i[2];else{if(3!=l.length)throw new Error("Arguments error.");u=(c=[e,r,t])[0],a=c[1],s=c[2]}f[u]={id:u,deps:a,factory:s,path:m}}).amd=!0,e.define=a,e.require=s,e.modules=f,s.root=c(window.location.href)});
//# sourceMappingURL=im.umd.js.map
