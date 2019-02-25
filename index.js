const util = require("./utils.js");
const uglify = require("uglify-js");
const fs = require("fs");
var concat = require("concat-files");

const siteData = {
  name: "Medical Arts Pharmacy",
  phone: "16194618551",
  desc:
    "At Medical Arts Pharmacy we work with the community and the people in it to give you the best service possible. Experience the Medical Arts Pharmacy difference for yourself.",
  keywords:
    "medical arts pharmacy,pharmacy,medical arts,prescription,refill prescription,transfer prescription",
  url: "https://rxmedarts.com",
  title: "Medical Arts Pharmacy"
};

util.registerPartials([
  {
    name: "header",
    path: "src/partials/header.hbs"
  },
  {
    name: "footer",
    path: "src/partials/footer.hbs"
  }
]);
util.saveHandlebarsToHtml("src/index.hbs", "docs/index.html", siteData);

util.saveHandlebarsToHtml(
  "src/aboutus.hbs",
  "docs/aboutus/index.html",
  Object.assign(siteData, {
    keywords: "independent alternative,printu patel,ucla",
    title: "About Us"
  })
);

util.saveHandlebarsToHtml(
  "src/contactus.hbs",
  "docs/contactus/index.html",
  Object.assign(siteData, {
    desc:
      "Contact us via phone or by submitting this contact us form in prescriptions, suggestions, or customer service.",
    keywords: "contact,contact us,medical arts pharmacy",
    title: "Contact Us"
  })
);

util.saveHandlebarsToHtml(
  "src/insurance.hbs",
  "docs/insurance/index.html",
  Object.assign(siteData, {
    desc:
      "Medical Arts Pharmacy tries to find the lowest prescription prices, when possible, for you. We will work with your Medicare D plans and physicians to find lower priced generic drugs whenever possible to keep prescription drugs affordable. ",
    keywords: "insurance,prescription,workers comp",
    title: "Insurance"
  })
);

util.saveHandlebarsToHtml(
  "src/ourservices.hbs",
  "docs/ourservices/index.html",
  Object.assign(siteData, {
    title: "Our Services"
  })
);

util.saveHandlebarsToHtml(
  "src/privacy.hbs",
  "docs/privacy/index.html",
  Object.assign(siteData, {
    title: "Privacy"
  })
);

util.saveHandlebarsToHtml(
    "src/resources.hbs",
    "docs/resources/index.html",
    Object.assign(siteData, {
      title: "Resources"
    })
  );

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
