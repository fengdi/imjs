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
  const rfile = /[^\/]+?$/;
  const isAbsolute = path => {
    return /^(?:\/|@|\w+:)/.test(path);
  };
  const currentScript = () => {
    return doc.currentScript;
  };
  const normalize = path => {
    path = path.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
    let parts = path.split("/"),
      absolute = isAbsolute(path),
      prefix = "";
    if (absolute) prefix = parts.shift() + "//";
    for (let i = 0; i < parts.length; ) {
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
      return "./";
    }
    return path.replace(rfile, "");
  };
  const filename = path => {
    return (rfile.exec(path) || [""])[0];
  };
  const realpath = (id, dir) => {
    const cwd = require.cwd;
    const a = doc.createElement("a");
    if (rfile.test(id)) {
      id = /\.js$/.test(id) ? id : `${id}.js`;
    } else {
      id = id + require.default;
    }
    a.href = normalize(
      isAbsolute(id) ? id.replace(/^@\//, `${cwd}/`) : `${dir || cwd}/${id}`
    );

    return normalize(a.href);
  };
  const modules = {
    // 'a' : {id:'a', deps:[], factory:(function(){}), dirname, filename, export:null}
  };
  
  const define = ( ...args ) => {
    const [id, deps, factory] = args;
    let i, d, f;
    const curScript = currentScript();
    const moduleId = curScript && curScript.$moduleId;
    if (args.length == 1) {
      [i, d, f] = [moduleId, [], id];
    } else if (args.length == 2) {
      [i, d, f] = [moduleId, id, deps];
    } else if (args.length == 3) {
      [i, d, f] = [id, deps, factory];
    } else {
      throw new Error("Arguments error.");
    }
    return modules[i] = {
      id: i,
      deps: d,
      factory: f,
      dirname: dirname(i),
      filename: filename(i),
      time: new Date().getTime()
    };
  };
  const loadScript = url => {
    return new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      script.addEventListener(
        "load",
        e => {
          resolve(modules[url])
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
      script.$moduleId = url;
      script.src = url + (require.tag ? "?" + require.tag : "");
      head.insertBefore(script, head.firstChild);
    });
  };
  const hooks = {};
  const setHook = (id, factory) =>{
    return hooks[realpath(id)] = factory;
  }
  const getHook = id => {
    const url = realpath(id);
    return hooks[url] && define(id, [], hooks[url])
  }
  const require = async function(id, callback) {

    const url = realpath(id);
    
    const module = modules[url] || await loadScript(url) || getHook(id);

    if (!module) throw new Error(`The module ${id} is not defined. You can define AMD module or use hook.`);
    
    const { deps = [], factory, dirname, filename } = module;

    if (!("export" in module)) {
      module.export = await factory.apply(
        { dirname, filename },
        (await Promise.all(deps.map(did => require(realpath(did, dirname))))) ||
          []
      );
      isFun(callback) && callback(module.export);
    }

    return module.export;
  };

  define.amd = true;

  host.define = define;

  host.require = require;

  require.modules = modules;

  require.default = "";

  require.cwd = "";

  require.tag = "";

  require.main = "";

  require.setHook = setHook;
  
  const curScript = currentScript();
  if (curScript) {
    try {
      const attr = curScript.attributes;
      ["cwd", "tag", "main", "default"].forEach(key => {
        let a;
        if ((a = attr[`data-${key}`])) {
          require[key] = a.nodeValue;
        }
      });
    } catch (e) {
      throw e;
    }
  }

  if (require.main) require(require.main);
})(window);
