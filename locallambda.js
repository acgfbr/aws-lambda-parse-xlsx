const lambdaLocal = require("lambda-local");

var jsonPayload = {
  Records: [
    {
      payload: {
        url: "spreadsheets/testeantonio.xlsx"
      }
    }
  ]
};

lambdaLocal.execute({
  event: jsonPayload,
  lambdaPath: "index.js",
  profilePath: "~/.aws/credentials",
  profileName: "default",
  timeoutMs: 180000,
  callback: function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
  },
  clientContext: JSON.stringify({ clientId: "xxxx" })
});
