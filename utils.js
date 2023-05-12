const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const uglify = require("uglify-js");

var concat = require("concat-files");
/**
 * inFile - string
 * outFile - string
 * data - object for handlebars
 */
function saveHandlebarsToHtml(inFile, outFile, data) {
  const source = fs.readFileSync(inFile, "utf8");
  const template = handlebars.compile(source, { strict: true });
  ensureDirectoryExistence(outFile);
  fs.writeFileSync(outFile, template(data), {});
}

module.exports.buildSiteFromJson = function buildSiteFromJson(json, src, dest) {
  var store = JSON.parse(json);
  if (!store.site) {
    throw new Error("Site property must be in file.");
  }
  if (!store.pages && Array.isArray(store.pages)) {
    throw new Error("Site pages must be an array");
  }
  store.site.staticRandom = Math.floor(Math.random() * Math.floor(1000000000));
  let partials = [];
  store.partials.forEach((partial) => {
    const partialName = partial.split(".")[0];
    partials.push({ name: partialName, path: `${src}/partials/${partial}` });
  });
  registerPartials(partials);
  store.pages.forEach((page) => {
    const pageKeyValue = Object.assign(store.site, page);
    const folder = page.file.replace(".hbs", "");
    let saveToPath = `${dest}/${folder}/index.html`;
    if (page.file === "index.hbs") {
      saveToPath = `${dest}/index.html`;
    }
    saveHandlebarsToHtml(`${src}/${page.file}`, saveToPath, pageKeyValue);
  });

  let siteMap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.schema.org/schemas/sitemap/0.9">`;
  store.pages.forEach((page) => {
    let folder = page.file.replace(".hbs", "");
    let priority = 0.8;
    if (page.file === "index.hbs") {
      priority = 1.0;
      folder = "";
    }
    siteMap += `<url><loc>${store.site.url}/${folder}</loc><priority>${priority}</priority></url>`;
  });
  siteMap += "</urlset>";
  fs.writeFileSync(`${dest}/sitemap.xml`, siteMap);

  let jsc = [];
  store.js.forEach((file) => {
    jsc.push(`${file}.c.js`);
    compressJs(file, `${file}.c.js`);
  });
  concat(jsc, `${dest}/js/site.js`, function (err) {
    if (err) throw err;
    // jsc.forEach((file) => {
    //   console.log(file);
    //   fs.unlink(file);
    // });
    // jsc.forEach(file => {
    //   fs.unlink(file);
    // });
  });

  concat(store.css, `${dest}/css/site.css`);
};

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function registerPartials(partials) {
  partials.forEach((partial) => {
    handlebars.registerPartial(
      partial.name,
      fs.readFileSync(partial.path, "utf8")
    );
  });
}

function compressJs(inFile, outFile) {
  var result = uglify.minify(fs.readFileSync(inFile, "utf8"), {});
  fs.writeFileSync(outFile, result.code, {});
  if (result.error) {
    console.log(result.error);
  }
  //console.log(result.code); // minified output//
  //console.log(result.map);  // source map
}
