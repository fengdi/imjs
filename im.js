/*
 ______                                  
/\__  _\                    __           
\/_/\ \/     ___ ___       /\_\    ____  
   \ \ \   /' __` __`\     \/\ \  /',__\ 
    \_\ \__/\ \/\ \/\ \  __ \ \ \/\__, `\
    /\_____\ \_\ \_\ \_\/\_\_\ \ \/\____/
    \/_____/\/_/\/_/\/_/\/_/\ \_\ \/___/ 
                           \ \____/      
                            \/___/      
*/

(function(host) {
  const o2s = {}.toString;
  const isFun = f => {
    return o2s.call(f) === "[object Function]";
  };
  const doc = document;
  const head = doc.getElementsByTagName("head")[0] || doc.documentElement;
  const isAbsolute = path => {
    return /^(?:\/|\w+:)/.test(path);
  };
  const normalize = path => {
    path = path.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
    var parts = path.split("/"),
      absolute = isAbsolute(path),
      prefix = "";
    if (absolute) prefix = parts.shift() + "//";
    for (var i = 0; i < parts.length; ) {
      if (parts[i] === "..") {
        if (i > 0 && parts[i - 1] !== "..") parts.splice(--i, 2);
        else if (absolute) parts.splice(i, 1);
        else ++i;
      } else if (parts[i] === ".") parts.splice(i, 1);
      else ++i;
    }
    return prefix + parts.join("/");
  };
  const dirname = path => {
    if (!path.match(/\//)) {
      return (path = "./");
    }
    return path.replace(/\/[^\/]+?$/g, "/");
  };
  const realpath = (dir, id) => {
    id = /\.js$/.test(id) ? id : `${id}.js`;
    return normalize(dir + "/" + id);
  };
  const modules = {
    // 'a' : {id:'a', deps:[], factory:(function(){}), path:'', export:null}
  };
  const define = function(id, deps, factory) {
    const args = arguments;
    let i, d, f;
    const curScript = doc.currentScript;
    const imId = curScript && curScript.$imId;
    const path = curScript && curScript.src;
    if (args.length == 1) {
      [i, d, f] = [imId, [], id];
    } else if (args.length == 2) {
      [i, d, f] = [imId, id, deps];
    } else if (args.length == 3) {
      [i, d, f] = [id, deps, factory];
    } else {
      throw new Error("Arguments error.");
    }

    modules[i] = { id: i, deps: d, factory: f, path };
  };
  const loadScript = function(url) {
    return new Promise((resolve, reject) => {
      var script = doc.createElement("script");
      script.addEventListener(
        "load",
        e => {
          resolve(modules[url]);
        },
        { once: true }
      );
      script.addEventListener(
        "error",
        e => {
          reject(`Not Found Module: ${url}`);
        },
        { once: true }
      );
      script.$imId = url;
      script.src = url.trim();
      head.insertBefore(script, head.firstChild);
    });
  };
  const require = async function(id, callback) {
    id = isAbsolute(id) ? id : realpath(require.root, id);

    let module = modules[id] || (await loadScript(id));

    const { deps = [], factory } = module;

    if ("export" in module) {
      return module.export;
    } else {
      module.export = factory.apply(
        host,
        (await Promise.all(
          deps.map(id => {
            return require(realpath(dirname(module.path), id));
          })
        )) || []
      );
      isFun(callback) && callback(module.export);
      return module.export;
    }
  };

  define.amd = true;

  host.define = define;

  host.require = require;

  host.modules = modules;

  require.root = dirname(window.location.href);
})(window);
