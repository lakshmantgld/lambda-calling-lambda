# Lambda-Calling-Lambda
There occurs a scenario where you need to call an **AWS Lambda** from another Lambda. Lambdas are event-driven. They are usually invoked by http(s), SQS, SNS, S3 and so on. This repo is all about invoking lambda using **AWS Lambda SDK**.

## Technical Architecture:
This high level architecture would help us understand, how to invoke **APIGateway-Lambda** which invokes another **Lambda**.
![Architecture diagram](https://raw.githubusercontent.com/lakshmantgld/lambda-calling-lambda/master/readmeFiles/architecture.png)

### Use-Case:
1. When you follow **DRY**(Don't Repeat Yourself) approach, there might be a common Lambda which needs to be invoked by other lambdas in the system.
2. The job might be a **small computation**(short job) and you don't want to waste the whole Ec2 server for this small computation. Since you don't have any common event-emitters like SNS, S3, SQS, you can invoke it using AWS Lambda SDK.

### Gotchas:
- The one requirement to invoke lambda is that proper **IAM permission/role** has to be associated with both **invoker and invoking lambda**. Let **LambdaA** be the **invoker** lambda and **LambdaB** be the **invoking** lambda. Both the lambdas has to be associated with the following permissions.

```yaml
iamRoleStatements:
  - Effect: 'Allow'
    Action:
      - "logs:CreateLogGroup"
      - "logs:CreateLogStream"
      - "logs:PutLogEvents"
      - "lambda:InvokeFunction"
    Resource: "*"
```

**P.S:** Since am using **serverless** framework, I have written in the YAML, which is the compatible format for serverless framework.

### AWS Lambda SDK:
See `handler.js` for the working example. **LambdaA** *invokes* **LambdaB** using AWS Lambda SDK.

**Note:** By default, the nodeJS lambda has the javascript `aws-sdk`. This means that you don't have to upload the `node_modules` containing the `aws-sdk`.

**Lambda invoke Function Definition:**

```js
invoke(params = {}, callback)
```

The lambda invocation operation with params and the callback.

```js
import aws from 'aws-sdk';

const lambda = new aws.Lambda({
    region: 'ap-northeast-1'
});

let params = {
  FunctionName: 'STRING_VALUE', /* required */
  ClientContext: 'STRING_VALUE',
  InvocationType: Event | RequestResponse | DryRun,
  LogType: None | Tail,
  Payload: new Buffer('...') || 'STRING_VALUE',
  Qualifier: 'STRING_VALUE'
};
lambda.invoke(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
```

If you are using the versioning feature, you can invoke the specific function version by providing function version or alias name that is pointing to the function version using the Qualifier parameter in the request. If you don't provide the Qualifier parameter, the $LATEST version of the Lambda function is invoked.

#### Parameters:

**params.FunctionName:** String

The Lambda function name. You can specify a function name (for example, LambdaB) or you can specify Amazon Resource Name (ARN) of the function (for example, `arn:aws:lambda:us-west-2:account-id:function:lambdaB`).

**params.InvocationType:** String

By default, the Invoke API assumes `RequestResponse` InvocationType. You can optionally request asynchronous execution by specifying `Event` as the InvocationType. If you want to just verify whether the invoking alambda has permission, but not actually invoking you can use `DryRun` as the InvocationType.

Possible values include:
- "Event"
- "RequestResponse"
- "DryRun"

**params.LogType:** String

You can set this optional parameter to `Tail` in the request only if you specify the `InvocationType` parameter with value `RequestResponse`. In this case, AWS Lambda returns the base64-encoded last 4 KB of log data produced by your Lambda function in the `x-amz-log-result` header.

Possible values include:
- "None"
- "Tail"

**params.ClientContext:** String

Using the `ClientContext` you can pass client-specific information to the Lambda function you are invoking. You can then process the client information in your invoking Lambda function as you choose through the context variable. The ClientContext JSON must be base64-encoded.

**params.Payload:** Buffer, Typed Array, Blob, String

JSON that you want to provide to your **Invoking Lambda** function as input.

**params.Qualifier:** String

You can use this optional parameter to specify a Lambda function version or alias name. If you specify a function version, the API uses the qualified function ARN to invoke a specific Lambda function. If you specify an alias name, the API uses the alias ARN to invoke the Lambda function version to which the alias points. If you don't provide this parameter, then the API uses unqualified function ARN which results in invocation of the `$LATEST` version.

----------------------
