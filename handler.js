/* eslint-disable global-require, import/first, no-unused-expressions, no-console */
if (!global._babelPolyfill) require('babel-polyfill');

import AWS from 'aws-sdk';

const lambda = new AWS.Lambda({
    region: 'ap-northeast-1'
});

module.exports.lambdaA = (event, context, callback) => {

  lambda.invoke({
    FunctionName: 'invoke-lambda-dev-lambdaB',
    InvocationType: 'RequestResponse',
    Payload: '{ "name" : "Toby" }'
  }, (error, data) => {
    if (error) {
      console.log("in error: ", error);
      callback(error);
    } else if (data.Payload) {
      console.log("in success: ", data.Payload);
      callback(null, data.Payload);
    } else {
      callback(null, data);      
    }
  });
};

module.exports.lambdaB = (event, context, callback) => {
  console.log("entered the function lambdaB");
  console.log('Lambda B Received event:', JSON.stringify(event, null, 2));
  callback(null, 'Hello ' + event.name);
};
