import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from "n8n-workflow";
import axios, { AxiosRequestConfig } from "axios";
import {
  PayloadCollectionPermissions,
  PayloadGlobalPermissions,
} from "./payload.types";

interface PayloadDiscoveryResponse {
  collections: PayloadCollectionPermissions[];
  globals: PayloadGlobalPermissions[];
}

export class PayloadCms implements INodeType {
  // Cache for authentication tokens
  private static authTokenCache = new Map<
    string,
    { token: string; expires: number }
  >();

  description: INodeTypeDescription = {
    displayName: "Payload CMS",
    name: "payloadCms",
    icon: "file:payloadcms.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: "Interact with Payload CMS collections and globals",
    defaults: {
      name: "Payload CMS",
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: "payloadCmsApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        required: true,
        default: "collection",
        options: [
          {
            name: "Collection",
            value: "collection",
          },
          {
            name: "Global",
            value: "global",
          },
          {
            name: "Auth",
            value: "auth",
          },
        ],
      },
      // Collection operations
      {
        displayName: "Collection",
        name: "collection",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getCollections",
        },
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["collection"],
          },
        },
        description: "Choose the collection to operate on",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        required: true,
        default: "find",
        displayOptions: {
          show: {
            resource: ["collection"],
          },
        },
        options: [
          {
            name: "Find",
            value: "find",
            description: "Find documents in collection",
          },
          {
            name: "Find by ID",
            value: "findById",
            description: "Find document by ID",
          },
          {
            name: "Create",
            value: "create",
            description: "Create new document",
          },
          {
            name: "Update",
            value: "update",
            description: "Update documents",
          },
          {
            name: "Update by ID",
            value: "updateById",
            description: "Update document by ID",
          },
          {
            name: "Delete",
            value: "delete",
            description: "Delete documents",
          },
          {
            name: "Delete by ID",
            value: "deleteById",
            description: "Delete document by ID",
          },
          {
            name: "Count",
            value: "count",
            description: "Count documents",
          },
        ],
      },
      // Global operations
      {
        displayName: "Global",
        name: "global",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getGlobals",
        },
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["global"],
          },
        },
        description: "Choose the global to operate on",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        required: true,
        default: "get",
        displayOptions: {
          show: {
            resource: ["global"],
          },
        },
        options: [
          {
            name: "Get",
            value: "get",
            description: "Get global data",
          },
          {
            name: "Update",
            value: "update",
            description: "Update global data",
          },
        ],
      },
      // ID field for operations that need it
      {
        displayName: "Document ID",
        name: "documentId",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["collection"],
            operation: ["findById", "updateById", "deleteById"],
          },
        },
        description: "The ID of the document to operate on",
      },
      // Data field for create/update operations
      {
        displayName: "Data",
        name: "data",
        type: "json",
        required: true,
        default: "{}",
        displayOptions: {
          show: {
            resource: ["collection"],
            operation: ["create", "update", "updateById"],
          },
        },
        description: "The data to send (JSON format)",
      },
      {
        displayName: "Data",
        name: "data",
        type: "json",
        required: true,
        default: "{}",
        displayOptions: {
          show: {
            resource: ["global"],
            operation: ["update"],
          },
        },
        description: "The data to send (JSON format)",
      },
      // Auth operations
      {
        displayName: "Auth Collection",
        name: "authCollection",
        type: "options",
        typeOptions: {
          loadOptionsMethod: "getAuthCollections",
        },
        required: true,
        default: "users",
        displayOptions: {
          show: {
            resource: ["auth"],
          },
        },
        description: "Choose the auth-enabled collection",
      },
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        required: true,
        default: "login",
        displayOptions: {
          show: {
            resource: ["auth"],
          },
        },
        options: [
          {
            name: "Login",
            value: "login",
            description: "Login user",
          },
          {
            name: "Logout",
            value: "logout",
            description: "Logout user",
          },
          {
            name: "Me",
            value: "me",
            description: "Get current user",
          },
          {
            name: "Refresh Token",
            value: "refresh",
            description: "Refresh authentication token",
          },
          {
            name: "Forgot Password",
            value: "forgotPassword",
            description: "Send forgot password email",
          },
          {
            name: "Reset Password",
            value: "resetPassword",
            description: "Reset user password",
          },
          {
            name: "Verify",
            value: "verify",
            description: "Verify user account",
          },
          {
            name: "Unlock",
            value: "unlock",
            description: "Unlock user account",
          },
        ],
      },
      // Auth data fields
      {
        displayName: "Email",
        name: "email",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["auth"],
            operation: ["login", "forgotPassword"],
          },
        },
        description: "User email address",
      },
      {
        displayName: "Password",
        name: "password",
        type: "string",
        typeOptions: {
          password: true,
        },
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["auth"],
            operation: ["login"],
          },
        },
        description: "User password",
      },
      {
        displayName: "Token",
        name: "token",
        type: "string",
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["auth"],
            operation: ["verify", "resetPassword"],
          },
        },
        description: "Verification or reset token",
      },
      {
        displayName: "New Password",
        name: "newPassword",
        type: "string",
        typeOptions: {
          password: true,
        },
        required: true,
        default: "",
        displayOptions: {
          show: {
            resource: ["auth"],
            operation: ["resetPassword"],
          },
        },
        description: "New password for reset",
      },
      // Query parameters
      {
        displayName: "Additional Options",
        name: "additionalOptions",
        type: "collection",
        placeholder: "Add Option",
        default: {},
        options: [
          {
            displayName: "Depth",
            name: "depth",
            type: "number",
            default: 1,
            description: "How deep to populate relationships",
          },
          {
            displayName: "Limit",
            name: "limit",
            type: "number",
            default: 10,
            description: "Maximum number of documents to return",
          },
          {
            displayName: "Page",
            name: "page",
            type: "number",
            default: 1,
            description: "Page number for pagination",
          },
          {
            displayName: "Sort",
            name: "sort",
            type: "string",
            default: "",
            description: "Sort field (use - for descending, e.g., -createdAt)",
          },
          {
            displayName: "Where",
            name: "where",
            type: "json",
            default: "{}",
            description: "Where clause for filtering (JSON format)",
          },
          {
            displayName: "Select",
            name: "select",
            type: "string",
            default: "",
            description: "Fields to select (comma-separated)",
          },
          {
            displayName: "Locale",
            name: "locale",
            type: "string",
            default: "",
            description: "Locale for localized content",
          },
        ],
      },
    ],
  };

  methods = {
    loadOptions: {
      async getCollections(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        try {
          const collections =
            await PayloadCms.prototype.discoverCollections.call(this);
          return collections.map(
            (collection: PayloadCollectionPermissions) => ({
              name: collection.labels?.plural || collection.slug,
              value: collection.slug,
            })
          );
        } catch (error) {
          throw new NodeOperationError(
            this.getNode(),
            `Failed to load collections: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      },

      async getGlobals(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        try {
          const globals = await PayloadCms.prototype.discoverGlobals.call(this);
          return globals.map((global: PayloadGlobalPermissions) => ({
            name: global.label || global.slug,
            value: global.slug,
          }));
        } catch (error) {
          throw new NodeOperationError(
            this.getNode(),
            `Failed to load globals: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      },

      async getAuthCollections(
        this: ILoadOptionsFunctions
      ): Promise<INodePropertyOptions[]> {
        try {
          const collections =
            await PayloadCms.prototype.discoverCollections.call(this);
          // Filter for auth-enabled collections or return common auth collections
          const authCollections = collections.filter(
            (collection: PayloadCollectionPermissions) =>
              collection.auth || collection.slug === "users"
          );

          if (authCollections.length > 0) {
            return authCollections.map(
              (collection: PayloadCollectionPermissions) => ({
                name: collection.labels?.plural || collection.slug,
                value: collection.slug,
              })
            );
          }

          // Fallback to common auth collection names
          return [
            { name: "Users", value: "users" },
            { name: "Admins", value: "admins" },
            { name: "Members", value: "members" },
          ];
        } catch (error) {
          // Return default auth collections if discovery fails
          return [{ name: "Users", value: "users" }];
        }
      },
    },
  };

  async discoverCollections(
    this: ILoadOptionsFunctions
  ): Promise<PayloadCollectionPermissions[]> {
    const credentials = await this.getCredentials("payloadCmsApi");
    const baseUrl = credentials.baseUrl as string;
    const permissionsEndpoint =
      (credentials.permissionsEndpoint as string) || "/api/permissions";

    try {
      // First, try to get collections from a potential admin endpoint
      // This is a common pattern in many CMS systems
      const response: PayloadDiscoveryResponse =
        await PayloadCms.prototype.makeAuthenticatedRequest.call(this, {
          method: "GET",
          url: `${baseUrl}${permissionsEndpoint}`,
        });
      return response.collections;
    } catch (error) {
      // If that fails, we'll try some common collection names
      // This is a fallback approach for discovery

      throw new NodeOperationError(
        this.getNode(),
        `Failed to load collections ensure that ${baseUrl}${permissionsEndpoint} exists. check https://github.com/warleon/n8n-payload-dynamic?tab=readme-ov-file#payload`
      );
    }
  }

  async discoverGlobals(
    this: ILoadOptionsFunctions
  ): Promise<PayloadGlobalPermissions[]> {
    const credentials = await this.getCredentials("payloadCmsApi");
    const baseUrl = credentials.baseUrl as string;
    const permissionsEndpoint =
      (credentials.permissionsEndpoint as string) || "/api";

    try {
      // Try to get globals from a potential admin endpoint
      const response: PayloadDiscoveryResponse =
        await PayloadCms.prototype.makeAuthenticatedRequest.call(this, {
          method: "GET",
          url: `${baseUrl}${permissionsEndpoint}`,
        });
      return response.globals;
    } catch (error) {
      // If that fails, we'll try some common global names
      throw new NodeOperationError(
        this.getNode(),
        `Failed to load globals ensure that ${baseUrl}${permissionsEndpoint} exists. check https://github.com/warleon/n8n-payload-dynamic?tab=readme-ov-file#payload`
      );
    }
  }

  // Helper method to make authenticated requests
  async makeAuthenticatedRequest(
    this: IExecuteFunctions | ILoadOptionsFunctions,
    config: AxiosRequestConfig
  ): Promise<any> {
    const credentials = await this.getCredentials("payloadCmsApi");
    const baseUrl = credentials.baseUrl as string;
    const apiPrefix = (credentials.apiPrefix as string) || "/api";
    const apiKey = credentials.apiKey as string;
    const userCollection = credentials.userCollection as string;

    // Add authorization header
    config.headers = {
      ...config.headers,
      Authorization: `${userCollection} API-Key ${apiKey}`,
      "Content-Type": "application/json",
    };

    return axios(config);
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const resource = this.getNodeParameter("resource", i) as string;
        const operation = this.getNodeParameter("operation", i) as string;
        const additionalOptions = this.getNodeParameter(
          "additionalOptions",
          i,
          {}
        ) as any;

        const credentials = await this.getCredentials("payloadCmsApi");
        const baseUrl = credentials.baseUrl as string;
        const apiPrefix = (credentials.apiPrefix as string) || "/api";

        let url = "";
        let method = "GET";
        let data: any = undefined;
        const params: any = {};

        // Add query parameters
        if (additionalOptions.depth !== undefined)
          params.depth = additionalOptions.depth;
        if (additionalOptions.limit !== undefined)
          params.limit = additionalOptions.limit;
        if (additionalOptions.page !== undefined)
          params.page = additionalOptions.page;
        if (additionalOptions.sort) params.sort = additionalOptions.sort;
        if (additionalOptions.where) {
          // Handle where clause - it should be a JSON object
          const whereClause =
            typeof additionalOptions.where === "string"
              ? JSON.parse(additionalOptions.where)
              : additionalOptions.where;
          params.where = JSON.stringify(whereClause);
        }
        if (additionalOptions.select) params.select = additionalOptions.select;
        if (additionalOptions.locale) params.locale = additionalOptions.locale;

        if (resource === "collection") {
          const collection = this.getNodeParameter("collection", i) as string;

          switch (operation) {
            case "find":
              url = `${baseUrl}${apiPrefix}/${collection}`;
              method = "GET";
              break;
            case "findById":
              const docId = this.getNodeParameter("documentId", i) as string;
              url = `${baseUrl}${apiPrefix}/${collection}/${docId}`;
              method = "GET";
              break;
            case "create":
              url = `${baseUrl}${apiPrefix}/${collection}`;
              method = "POST";
              data = this.getNodeParameter("data", i);
              break;
            case "update":
              url = `${baseUrl}${apiPrefix}/${collection}`;
              method = "PATCH";
              data = this.getNodeParameter("data", i);
              break;
            case "updateById":
              const updateId = this.getNodeParameter("documentId", i) as string;
              url = `${baseUrl}${apiPrefix}/${collection}/${updateId}`;
              method = "PATCH";
              data = this.getNodeParameter("data", i);
              break;
            case "delete":
              url = `${baseUrl}${apiPrefix}/${collection}`;
              method = "DELETE";
              // For bulk delete, we need to pass where clause in the body
              if (additionalOptions.where) {
                data = {
                  where:
                    typeof additionalOptions.where === "string"
                      ? JSON.parse(additionalOptions.where)
                      : additionalOptions.where,
                };
              }
              break;
            case "deleteById":
              const deleteId = this.getNodeParameter("documentId", i) as string;
              url = `${baseUrl}${apiPrefix}/${collection}/${deleteId}`;
              method = "DELETE";
              break;
            case "count":
              url = `${baseUrl}${apiPrefix}/${collection}/count`;
              method = "GET";
              break;
          }
        } else if (resource === "global") {
          const global = this.getNodeParameter("global", i) as string;

          switch (operation) {
            case "get":
              url = `${baseUrl}${apiPrefix}/globals/${global}`;
              method = "GET";
              break;
            case "update":
              url = `${baseUrl}${apiPrefix}/globals/${global}`;
              method = "POST";
              data = this.getNodeParameter("data", i);
              break;
          }
        } else if (resource === "auth") {
          const authCollection = this.getNodeParameter(
            "authCollection",
            i
          ) as string;

          switch (operation) {
            case "login":
              url = `${baseUrl}${apiPrefix}/${authCollection}/login`;
              method = "POST";
              data = {
                email: this.getNodeParameter("email", i),
                password: this.getNodeParameter("password", i),
              };
              break;
            case "logout":
              url = `${baseUrl}${apiPrefix}/${authCollection}/logout`;
              method = "POST";
              break;
            case "me":
              url = `${baseUrl}${apiPrefix}/${authCollection}/me`;
              method = "GET";
              break;
            case "refresh":
              url = `${baseUrl}${apiPrefix}/${authCollection}/refresh-token`;
              method = "POST";
              break;
            case "forgotPassword":
              url = `${baseUrl}${apiPrefix}/${authCollection}/forgot-password`;
              method = "POST";
              data = {
                email: this.getNodeParameter("email", i),
              };
              break;
            case "resetPassword":
              url = `${baseUrl}${apiPrefix}/${authCollection}/reset-password`;
              method = "POST";
              data = {
                token: this.getNodeParameter("token", i),
                password: this.getNodeParameter("newPassword", i),
              };
              break;
            case "verify":
              const token = this.getNodeParameter("token", i) as string;
              url = `${baseUrl}${apiPrefix}/${authCollection}/verify/${token}`;
              method = "POST";
              break;
            case "unlock":
              url = `${baseUrl}${apiPrefix}/${authCollection}/unlock`;
              method = "POST";
              data = {
                email: this.getNodeParameter("email", i),
              };
              break;
          }
        }

        const requestConfig: AxiosRequestConfig = {
          method: method as any,
          url,
          params,
        };

        if (data) {
          requestConfig.data =
            typeof data === "string" ? JSON.parse(data) : data;
        }

        const response =
          await PayloadCms.prototype.makeAuthenticatedRequest.call(
            this,
            requestConfig
          );

        returnData.push({
          json: response.data,
          pairedItem: {
            item: i,
          },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
            pairedItem: {
              item: i,
            },
          });
        } else {
          throw error instanceof Error
            ? error
            : new Error("Unknown error occurred");
        }
      }
    }

    return [returnData];
  }
}
