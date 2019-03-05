const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");

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
  let partials = [];
  store.partials.forEach(partial => {
    const partialName = partial.split("/")[1].split(".")[0];
    partials.push({ name: partialName, path: `${src}/${partial}` });
  });
  registerPartials(partials);
  store.pages.forEach(page => {
    const pageKeyValue = Object.assign(store.site, page);
    const folder = page.file.replace(".hbs", "");
    let saveToPath = `${dest}/${folder}/index.html`;
    if (page.file === "index.hbs") {
      saveToPath = `${dest}/index.html`;
    }
    saveHandlebarsToHtml(`${src}/${page.file}`, saveToPath, pageKeyValue);
  });

  let siteMap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.schema.org/schemas/sitemap/0.9">`;
  store.pages.forEach(page => {
    let folder = page.file.replace(".hbs", "");
    let priority = 0.8;
    if (page.file === "index.hbs") {
      priority = 1.0;
      folder = "";
    }
    siteMap += `<url><loc>${
      store.site.url
    }/${folder}</loc><priority>${priority}</priority></url>`;
  });
  siteMap += "</urlset>";
  fs.writeFileSync(`${dest}/sitemap.xml`, siteMap);
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
  partials.forEach(partial => {
    handlebars.registerPartial(
      partial.name,
      fs.readFileSync(partial.path, "utf8")
    );
  });
}
