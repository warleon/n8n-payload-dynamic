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
      displayName: "Email",
      name: "email",
      type: "string",
      default: "",
      description: "Your PayloadCMS user email",
      required: true,
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
  ];
}
