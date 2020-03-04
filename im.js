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

  const currentScript = () => {
    return doc.currentScript;
  };
  let uid = 0;
  const uuid = () => {
    return "m-" + (++uid).toString(32);
  };
  const rfile = /[^\/]+?$/;
  const normalize = path => {
    path = path.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
    let parts = path.split("/"),
      absolute = isAbsolute(path),
      prefix = "";
    if (absolute) prefix = parts[0] ? parts.shift() + "//" : "";
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
  const isAbsolute = path => {
    return /^(?:\/|\w+:)/.test(path);
  };
  const dirname = path => {
    return ("" + path).replace(rfile, "");
  };
  const filename = path => {
    return (rfile.exec("" + path) || [""])[0];
  };
  const realpath = (id, dir) => {
    dir = dir || "";
    let url = "";
    if (rfile.test(id)) {
      id = /\.js$/.test(id) ? id : `${id}.js`;
    } else {
      id = id + require.default;
    }

    if (isAbsolute(id)) {
      url = id;
    } else if (id[0] && id[0] in aliasRoots) {
      url = replaceAliasRoots(id);
    } else {
      dir = replaceAliasRoots(dir);
      url = dir ? `${dir}/${id}` : id;
    }

    return normalize(url);
  };
  const modules = {
    // 'a' : {id:'a', deps:[], factory:(function(){}), dirname, filename, export:null}
  };

  const aliasRoots = {
    get "/"() {
      const loc = window.location;
      return normalize(loc.origin + dirname(loc.pathname));
    },
    get "@"() {
      let cwd = require.cwd;
      if (isAbsolute(cwd)) {
        return cwd;
      } else {
        return normalize(aliasRoots["/"] + (require.cwd || "./"));
      }
    }
  };
  const replaceAliasRoots = (url = "") => {
    return url.replace(/^[\s\S]/, a => {
      if (a in aliasRoots) {
        return aliasRoots[a];
      } else {
        return a;
      }
    });
  };
  const define = (...args) => {
    const [id, deps, factory] = args;
    let i, d, f;
    const curScript = currentScript();
    const moduleId = curScript && curScript.$id;
    const moduleUrl = curScript && curScript.$url;
    if (args.length == 1) {
      [i, d, f] = [moduleId, [], id];
    } else if (args.length == 2) {
      [i, d, f] = [moduleId, id, deps];
    } else if (args.length == 3) {
      [i, d, f] = [id, deps, factory];
    } else {
      throw new Error("Arguments error.");
    }
    return (modules[i] = modules[i] || {
      id: i,
      uuid: uuid(),
      url: moduleUrl,
      deps: d,
      factory: f,
      dirname: dirname(moduleUrl),
      filename: filename(moduleUrl),
      time: new Date().getTime()
    });
  };
  const loadScript = (id, dir) => {
    let url = realpath(id, dir);

    return new Promise((resolve, reject) => {
      const script = doc.createElement("script");
      script.addEventListener(
        "load",
        e => {
          resolve(modules[id]);
          head && script && script.parentNode && head.removeChild(script);
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
      script.$id = id;
      script.$url = url;
      script.src = url + (require.tag ? "?" + require.tag : "");
      head.insertBefore(script, head.firstChild);
    });
  };
  const hooks = {};
  const setHook = (id, factory) => {
    return (hooks[realpath(id)] = factory);
  };
  const getHook = id => {
    const url = realpath(id);
    return hooks[url] && define(id, [], hooks[url]);
  };

  const fetchModule = async (id, root, path = []) => {
    const module = modules[id] || (await loadScript(id, root)) || getHook(id);

    if (!module)
      throw new Error(
        `The module ${id} is not defined. You can define AMD module or use hook.`
      );
    // path.push(id);

    const { deps = [], factory, dirname, filename } = module;

    if (!("export" in module)) {
      module.export = await factory.apply(
        { dirname, filename },
        (await Promise.all(deps.map(did => fetchModule(did, dirname, path)))) ||
          []
      );
    }
    return module.export;
  };

  const require = async (id, callback) => {
    id = id.trim();
    let modulesExport = await fetchModule(id, require.cwd);
    isFun(callback) && callback(modulesExport);
    return modulesExport;
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

  if (!window.__IM_DONOT_AUTO_RUN__ && require.main) require(require.main);
})(window);
