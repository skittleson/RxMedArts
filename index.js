const util = require("./utils.js");
const uglify = require("uglify-js");
const fs = require("fs");
var concat = require("concat-files");

util.buildSiteFromJson(fs.readFileSync('site.json', "utf8"), "src", "docs");

const js = [
  "src/js/0_jquery.min.js",
  "src/js/1_bootstrap.js",
  "src/js/2_jquery.lazyload.min.js"
];
let jsc = [];
js.forEach(file => {
  jsc.push(`${file}.c.js`);
  compressJs(file, `${file}.c.js`);
});
concat(jsc, "docs/js/site.js", function(err) {
  if (err) throw err;
  jsc.forEach(file => {
    fs.unlink(file);
  });
});

function compressJs(inFile, outFile) {
  var result = uglify.minify(fs.readFileSync(inFile, "utf8"), {});
  fs.writeFileSync(outFile, result.code, {});
  //console.log(result.code); // minified output//
  //console.log(result.map);  // source map
}
