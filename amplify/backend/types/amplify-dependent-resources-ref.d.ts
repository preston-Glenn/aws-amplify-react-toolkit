export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "userPoolGroups": {
            "adminGroupRole": "string"
        },
        "awstoolkitd5af8046d5af8046": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string",
            "CreatedSNSRole": "string"
        }
    },
    "function": {
        "addIotPolicyToFederatedUser": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "echoApi": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "amplifytoolkit": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    },
    "interactions": {
        "chatbot": {
            "Region": "string",
            "BotName": "string",
            "FunctionArn": "string"
        }
    }
}