/* eslint-disable global-require, import/first, no-unused-expressions, no-console */
if (!global._babelPolyfill) require('babel-polyfill');

var aws = require('aws-sdk');

var lambda = new aws.Lambda({
    region: 'ap-northeast-1'
});

module.exports.lambdaA = (event, context, callback) => {
  console.log("entered the function lambdaA");

  lambda.invoke({
    FunctionName: 'invoke-lambda-dev-lambdaB',
    InvocationType: 'RequestResponse',
    Payload: '{ "name" : "Alex" }'
  }, function(error, data) {
    if (error) {
      console.log("in error", error);
      callback(error);
    }
    if (data.Payload) {
      console.log("in success", data.Payload);
      callback(null, data.Payload);
    }
  });

};

module.exports.lambdaB = (event, context, callback) => {
  console.log("entered the function lambdaB");
  console.log('Lambda B Received event:', JSON.stringify(event, null, 2));
  context.succeed('Hello ' + event.name);
};
