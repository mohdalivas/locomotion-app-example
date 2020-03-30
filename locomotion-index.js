// node_modules/locomotion/index.js
// a service locator example
const git = require("simple-git/promise")("./");
const fs = require("fs");
const path = require("path");
const shellJs = require('shelljs');

if (!fs.existsSync("./plugins.json")) {
  throw "You need to create a plugins.json file!";
}
const pluginCfg = JSON.parse(fs.readFileSync("./plugins.json"));
const services = [];

//create plugin path if it doesn't exist
console.log('pluginCfg.path', pluginCfg.path)
if (!fs.existsSync(pluginCfg.path)) {
  fs.mkdirSync(pluginCfg.path);
}

module.exports = new Promise((resolve, reject) => {
  let cwd = shellJs.pwd().toString(); console.log('cwd', cwd)
  Promise.all(pluginCfg.plugins.map(p => {
    console.log('p', p)
    let plugPath = path.join(pluginCfg.path, p.dir);
    // clone or pull latest version || roll your own version handling using tags or whatever.
    console.log('p.source', p.source); console.log('plugPath', plugPath)
    if (!fs.existsSync(plugPath)) {
      // return git.cwd(plugPath).clone(p.source)
      shellJs.cd(pluginCfg.path)
      return git.clone(p.source)
    } else {
      // return git.cwd(plugPath).pull();
      shellJs.cd(plugPath)
      return git.pull();
    }
  })).then(() => {
    pluginCfg.plugins.forEach(p => {
      //load up all services into the service list, in a real world example you probably need to add configurations and stuff, 
      //I recommend the builder pattern for this...
      // let modPath = path.join(process.cwd(), pluginCfg.path, p.dir, "index.js").replace(new RegExp(/\\/g), "/");;
      let modPath = path.join(cwd, pluginCfg.path, p.dir, "index.js").replace(new RegExp(/\\/g), "/");
      console.log('modPath', modPath)
      services[p.module] = require(modPath);
      console.info("added: " + p.module);
    });
    let locator = {
      //function to find a service in the list
      locate: function (service) {
        if (services[service]) {
          return services[service];
        } else {
          return null;
          //throw errors or whatever...
        }
      }
    }
    resolve(locator);
  }).catch(err => {
    console.error(err);
    reject(err);
  });
});