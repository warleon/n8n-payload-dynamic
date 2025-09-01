# n8n Payload CMS Node

A dynamic n8n node for Payload CMS that automatically discovers collections and operations, allowing you to interact with any Payload CMS instance via the REST API.

_Forked from [n8n-payload-dynamic](https://github.com/leadership-institute/n8n-payload-dynamic)_

## Features

- **Dynamic Collection Discovery**: Automatically discovers available collections from your Payload CMS instance
- **Dynamic Global Discovery**: Automatically discovers available globals from your Payload CMS instance
- **Full CRUD Operations**: Support for all standard operations (Create, Read, Update, Delete, Count)
- **Advanced Query Support**: Includes support for filtering, sorting, pagination, depth control, and localization
- **Flexible Authentication**: Uses API key authentication with configurable API prefix
- **Error Handling**: Robust error handling with detailed error messages

## Installation

### Payload

In your payload server create one endpoint to fetch the permissions for your user

#### src/endpoints/permissions.ts

```typescript
import type { Endpoint, PayloadRequest } from "payload";

export const permissionsEndpoint: Endpoint = {
  path: "/permissions",
  method: "get",
  handler: async (req: PayloadRequest) => {
    const { payload } = req;
    const { permissions } = await payload.auth({ req, headers: req.headers });

    const collections = permissions.collections;
    const globals = permissions.globals;

    return Response.json({ collections, globals });
  },
};
```

#### src/payload.config.ts

```typescript
import { buildConfig } from "payload/config";
import { permissionsEndpoint } from "./endpoints"; // import the endpoint

export default buildConfig({
  // your collections, globals, etc
  endpoints: [permissionsEndpoint], // add the endpoint
});
```

### n8n

1. In your n8n instance go to "Settings"
1. Then go to "Comunity nodes" and click the install button
1. paste the following into the "npm Package Name" field

> > ```
> > @warleon/n8n-nodes-payload-cms
> > ```

4. Accept the checkpbox and click install

![install](/media/install.png)

## Configuration

### Credentials Setup

1. In n8n, create new credentials of type "Payload CMS API"
2. Configure the following fields:
   - **Base URL**: The base URL of your Payload CMS instance (e.g., `https://your-payload-instance.com`)
   - **API key**: the generated api key for your user
   - **User Collection**: The collection slug for users (default: `users`)
   - **API Prefix**: The API route prefix (default: `/api`)

### Getting Credentials

Use any valid user account from your PayloadCMS instance. The node will automatically:

- Login when first used
- Cache the authentication token for 1 hour
- Refresh tokens as needed
- Handle session management transparently

No API keys are required - the node uses PayloadCMS's standard login authentication flow.

## Usage

### Collection Operations

The node supports the following operations on collections:

- **Find**: Retrieve multiple documents from a collection
- **Find by ID**: Retrieve a specific document by its ID
- **Create**: Create a new document in a collection
- **Update**: Update multiple documents in a collection (requires where clause)
- **Update by ID**: Update a specific document by its ID
- **Delete**: Delete multiple documents from a collection (requires where clause)
- **Delete by ID**: Delete a specific document by its ID
- **Count**: Count documents in a collection

### Global Operations

The node supports the following operations on globals:

- **Get**: Retrieve global data
- **Update**: Update global data

### Auth Operations

The node supports the following authentication operations:

- **Login**: Authenticate a user with email and password
- **Logout**: Log out the current user
- **Me**: Get current authenticated user information
- **Refresh Token**: Refresh the authentication token
- **Forgot Password**: Send a forgot password email
- **Reset Password**: Reset user password with a token
- **Verify**: Verify user account with a verification token
- **Unlock**: Unlock a user account

### Query Parameters

The node supports all standard Payload CMS query parameters:

- **Depth**: Control how deep to populate relationships (default: 1)
- **Limit**: Maximum number of documents to return (default: 10)
- **Page**: Page number for pagination (default: 1)
- **Sort**: Sort field (use `-` prefix for descending, e.g., `-createdAt`)
- **Where**: JSON object for filtering documents
- **Select**: Comma-separated list of fields to include in the response
- **Locale**: Locale for localized content

### Example Usage

#### Finding Posts with Filtering

```json
{
  "resource": "collection",
  "collection": "posts",
  "operation": "find",
  "additionalOptions": {
    "where": {
      "status": {
        "equals": "published"
      }
    },
    "limit": 20,
    "sort": "-createdAt"
  }
}
```

#### Creating a New Document

```json
{
  "resource": "collection",
  "collection": "posts",
  "operation": "create",
  "data": {
    "title": "My New Post",
    "content": "This is the content of my new post",
    "status": "draft"
  }
}
```

#### Updating Global Settings

```json
{
  "resource": "global",
  "global": "settings",
  "operation": "update",
  "data": {
    "siteName": "My Updated Site Name",
    "siteDescription": "Updated description"
  }
}
```

## Dynamic Discovery

The node automatically discovers available collections and globals from your Payload CMS instance using the following methods:

1. **Primary Method**: Attempts to fetch collections/globals from admin endpoints (`/api/collections`, `/api/globals`)
2. **Fallback Method**: Tests common collection/global names to discover what's available

### Common Collections Tested

- users
- posts
- pages
- media
- categories
- tags

### Common Globals Tested

- settings
- config
- navigation
- footer
- header

## Error Handling

The node includes comprehensive error handling:

- **Connection Errors**: Clear messages when unable to connect to Payload CMS
- **Authentication Errors**: Specific messages for API key issues
- **Discovery Errors**: Helpful messages when collections/globals cannot be discovered
- **Operation Errors**: Detailed error information for failed operations

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Payload CMS REST API Reference

This node is built according to the official Payload CMS REST API documentation:
https://payloadcms.com/docs/rest-api/overview

## Supported Payload CMS Versions

This node is designed to work with Payload CMS v2.x and v3.x. It uses the standard REST API endpoints that are consistent across versions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

1. Check the Payload CMS documentation: https://payloadcms.com/docs
2. Review the n8n node development documentation
3. Open an issue in this repository

## Changelog

### v1.2.0

- **Simplified Authentication**: Removed API key authentication, now uses username/password only
- **Cleaner Interface**: Simplified credentials configuration with fewer options
- **Focused on PayloadCMS Standards**: Aligned with PayloadCMS's primary authentication method
- **Reduced Complexity**: Streamlined codebase by removing unused authentication paths

### v1.1.0

- **Automatic Authentication**: Added support for username/password authentication with automatic login
- **Token Caching**: Implemented 1-hour token caching for improved performance
- **Session Management**: Automatic token refresh and session handling
- **Backward Compatibility**: Maintained support for API key authentication
- **Enhanced Credentials**: New authentication method selection in credentials configuration

### v1.0.0

- Initial release
- Dynamic collection and global discovery
- Full CRUD operations support
- Advanced query parameter support
- Robust error handling
