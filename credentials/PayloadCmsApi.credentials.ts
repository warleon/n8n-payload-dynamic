import {
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class PayloadCmsApi implements ICredentialType {
  name = "payloadCmsApi";
  displayName = "Payload CMS API";
  documentationUrl = "https://github.com/warleon/n8n-payload-dynamic#readme";
  properties: INodeProperties[] = [
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "",
      placeholder: "https://your-payload-instance.com",
      description: "The base URL of your Payload CMS instance",
      required: true,
    },
    {
      displayName: "API key",
      name: "apiKey",
      type: "string",
      default: "",
      description:
        "Your generated api key for the user you want to interface as",
      required: true,
    },
    {
      displayName: "User Collection",
      name: "userCollection",
      type: "string",
      default: "users",
      description: "The collection slug for users (default: users)",
    },
    {
      displayName: "API Prefix",
      name: "apiPrefix",
      type: "string",
      default: "/api",
      description: "The API route prefix (default: /api)",
    },
    {
      displayName: "Refection endpoint",
      name: "endpoint",
      type: "string",
      default: "/api/permissions",
      description:
        "The API route to the reflection endpoint as described in https://github.com/warleon/n8n-payload-dynamic?tab=readme-ov-file#payload",
    },
  ];
  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.baseUrl}}", // comes from user input
      url: "/{{$credentials.apiPrefix}}/{{$credentials.endpoint}}",
      method: "GET",
      headers: {
        Authorization:
          "{{$credentials.userCollection}} API-Key {{$credentials.apiKey}}",
      },
    },
  };
}
