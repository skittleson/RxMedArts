const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const https = require("https");
const querystring = require("querystring");
const badRequest =
  "There was an issue with the form submission.  Please call us or try again later.";

exports.handler = async event => {
  let formMessage = JSON.parse(event.body);
  try {
    const g = await googleSiteVerifyPost(
      formMessage.token,
      process.env.GoogleRecapKey
    );
    if (!g.success) {
      const errorMessages = (g["error-codes"] || []).toString();
      return {
        statusCode: 400,
        body: errorMessages + badRequest
      };
    }
    formMessage.score = g.score;
  } catch (postError) {
    return { statusCode: 500, body: badRequest };
  }
  delete formMessage.token;
  const unix = Math.round(+new Date() / 1000);
  try {
    await s3
      .putObject({
        Bucket: process.env.MessageBucket,
        Key: `${unix}.json`,
        Body: JSON.stringify(formMessage)
      })
      .promise();
  } catch (error) {
    console.log(`${error} Access to or missing s3 bucket is likely an issue.`);
  }
  delete formMessage.score;
  let snsMessage = keyValueStringBuilder(formMessage);

  try {
    // Create promise and SNS service object
    await new AWS.SNS({ apiVersion: "2010-03-31" })
      .publish({
        Subject: "Request Form",
        Message: snsMessage,
        TopicArn: process.env.SnsTopicArn
      })
      .promise();
  } catch (error) {
    return { statusCode: 400, body: badRequest };
  }
  return { statusCode: 200, body: "" };
};

function keyValueStringBuilder(parseObject) {
  var content = "";
  Object.keys(parseObject).forEach(key => {
    var value = parseObject[key];
    var type = typeof value;
    if (type === "object") {
      content += keyValueStringBuilder(value);
    } else {
      content += key + ": " + value + "\n";
    }
  });
  return content;
}

function googleSiteVerifyPost(token, secret) {
  return new Promise(function(resolve, reject) {
    var postData = querystring.stringify({
      secret: secret,
      response: token
    });
    var options = {
      hostname: "www.google.com",
      port: 443,
      path: "/recaptcha/api/siteverify",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": postData.length
      }
    };
    var req = https.request(options, res => {
      res.setEncoding("utf8");
      res.on("data", d => {
        resolve(JSON.parse(d.toString()));
      });
    });
    req.on("error", e => {
      reject(e);
    });
    req.write(postData);
    req.end();
  });
}
