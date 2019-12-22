const functions = require("firebase-functions");
const scan = require("./scan");

exports.chromeFeedback = functions.https.onRequest((request, response) => {
  const { id, reviews, issues, returnQty } = request.query;
  const re = /[a-z]{32}/;
  if (re.test(id))
    scan(id, reviews, issues, returnQty).then(results => {
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "GET");
      response.send(results);
    });
  else response.send(400);
});
