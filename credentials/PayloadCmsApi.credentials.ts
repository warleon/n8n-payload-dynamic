import { ICredentialType, INodeProperties } from "n8n-workflow";

export class PayloadCmsApi implements ICredentialType {
  name = "payloadCmsApi";
  displayName = "Payload CMS API";
  documentationUrl = "https://payloadcms.com/docs/rest-api/overview";
  properties: INodeProperties[] = [
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://your-payload-instance.com",
      placeholder: "https://your-payload-instance.com",
      description: "The base URL of your Payload CMS instance",
      required: true,
    },
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      description: "Your Payload CMS API key",
      required: true,
    },
    {
      displayName: "API Prefix",
      name: "apiPrefix",
      type: "string",
      default: "/api",
      description: "The API route prefix (default: /api)",
      required: false,
    },
  ];

  authenticate = {
    type: "generic" as const,
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };
}
