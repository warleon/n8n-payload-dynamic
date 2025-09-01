import {
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class PayloadCmsApi implements ICredentialType {
  name = "payloadCmsApi";
  displayName = "Payload CMS API";
  documentationUrl = "https://payloadcms.com/docs/rest-api/overview";
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
      name: "api key",
      type: "string",
      default: "",
      description:
        "Your generated api key for the user you want to interface as",
      required: true,
    },
    {
      displayName: "API Prefix",
      name: "apiPrefix",
      type: "string",
      default: "/api",
      description: "The API route prefix (default: /api)",
    },
  ];
  test: ICredentialTestRequest = {
    request: {},
  };
}
