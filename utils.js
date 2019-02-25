const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");


/**
 * inFile - string
 * outFile - string
 * data - object for handlebars
 */
module.exports.saveHandlebarsToHtml = function saveHandlebarsToHtml(
  inFile,
  outFile,
  data
) {
  const source = fs.readFileSync(inFile, "utf8");
  const template = handlebars.compile(source, { strict: true });
  ensureDirectoryExistence(outFile);
  fs.writeFileSync(outFile, template(data), {});
};

function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

module.exports.registerPartials = function(partials){
  partials.forEach(partial => {
    handlebars.registerPartial(
      partial.name,
      fs.readFileSync(partial.path, "utf8")
    );
  });
}
