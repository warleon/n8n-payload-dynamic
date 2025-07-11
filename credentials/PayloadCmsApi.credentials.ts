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
      displayName: "Authentication Method",
      name: "authMethod",
      type: "options",
      options: [
        {
          name: "Username & Password",
          value: "credentials",
        },
        {
          name: "API Key",
          value: "apiKey",
        },
      ],
      default: "credentials",
      description: "Choose how to authenticate with PayloadCMS",
    },
    {
      displayName: "Email",
      name: "email",
      type: "string",
      default: "",
      description: "Your PayloadCMS user email",
      required: true,
      displayOptions: {
        show: {
          authMethod: ["credentials"],
        },
      },
    },
    {
      displayName: "Password",
      name: "password",
      type: "string",
      typeOptions: {
        password: true,
      },
      default: "",
      description: "Your PayloadCMS user password",
      required: true,
      displayOptions: {
        show: {
          authMethod: ["credentials"],
        },
      },
    },
    {
      displayName: "User Collection",
      name: "userCollection",
      type: "string",
      default: "users",
      description: "The collection slug for users (default: users)",
      displayOptions: {
        show: {
          authMethod: ["credentials"],
        },
      },
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
      displayOptions: {
        show: {
          authMethod: ["apiKey"],
        },
      },
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
}
