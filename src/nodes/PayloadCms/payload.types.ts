import type { DeepRequired } from "ts-essentials";

export interface SanitizedGlobalConfig extends GlobalConfig {
  fields: PayloadField[];
  slug: GlobalSlug;
}

export interface SanitizedCollectionConfig
  extends DeepRequired<CollectionConfig> {
  auth: Auth;
  fields: PayloadField[];
  slug: CollectionSlug;
}

export type CollectionConfig<TSlug extends object = any> = {
  /**
   * Label configuration
   */
  labels?: {
    plural?: StaticLabel;
    singular?: StaticLabel;
  };
  /**
   * Enables / Disables the ability to lock documents while editing
   * @default true
   */
  lockDocuments?:
    | {
        duration: number;
      }
    | false;
  /**
   * If true, enables custom ordering for the collection, and documents in the listView can be reordered via drag and drop.
   * New documents are inserted at the end of the list according to this parameter.
   *
   * Under the hood, a field with {@link https://observablehq.com/@dgreensp/implementing-fractional-indexing|fractional indexing} is used to optimize inserts and reorderings.
   *
   * @default false
   *
   * @experimental There may be frequent breaking changes to this API
   */
  orderable?: boolean;
  /**
   * Add `createdAt`, `deletedAt` and `updatedAt` fields
   *
   * @default true
   */
  timestamps?: boolean;
  /**
   * Enables trash support for this collection.
   *
   * When enabled, documents will include a `deletedAt` timestamp field.
   * This allows documents to be marked as deleted without being permanently removed.
   * The `deletedAt` field will be set to the current date and time when a document is trashed.
   *
   * @experimental This is a beta feature and its behavior may be refined in future releases.
   * @default false
   */
  trash?: boolean;
  /**
   * Options used in typescript generation
   */
  typescript?: {
    /**
     * Typescript generation name given to the interface type
     */
    interface?: string;
  };
};
export type StaticLabel = string;

export type Auth = DeepRequired<IncomingAuthType> | false;
export interface IncomingAuthType {
  /**
   * Set cookie options, including secure, sameSite, and domain. For advanced users.
   */
  cookies?: {
    domain?: string;
    sameSite?: "Lax" | "None" | "Strict" | boolean;
    secure?: boolean;
  };
  /**
   * How many levels deep a user document should be populated when creating the JWT and binding the user to the req. Defaults to 0 and should only be modified if absolutely necessary, as this will affect performance.
   * @default 0
   */
  depth?: number;
  /**
   * Advanced - disable Payload's built-in local auth strategy. Only use this property if you have replaced Payload's auth mechanisms with your own.
   */
  disableLocalStrategy?:
    | {
        /**
         * Include auth fields on the collection even though the local strategy is disabled.
         * Useful when you do not want the database or types to vary depending on the auth configuration.
         */
        enableFields?: true;
        optionalPassword?: true;
      }
    | true;
  /**
   * Set the time (in milliseconds) that a user should be locked out if they fail authentication more times than maxLoginAttempts allows for.
   */
  lockTime?: number;
  /**
   * Only allow a user to attempt logging in X amount of times. Automatically locks out a user from authenticating if this limit is passed. Set to 0 to disable.
   */
  maxLoginAttempts?: number;
  /***
   * Set to true if you want to remove the token from the returned authentication API responses such as login or refresh.
   */
  removeTokenFromResponses?: true;
  /**
   * Controls how many seconds the token will be valid for. Default is 2 hours.
   * @default 7200
   * @link https://payloadcms.com/docs/authentication/overview#config-options
   */
  tokenExpiration?: number;
  /**
   * Payload Authentication provides for API keys to be set on each user within an Authentication-enabled Collection.
   * @default false
   * @link https://payloadcms.com/docs/authentication/api-keys
   */
  useAPIKey?: boolean;
  /**
   * Use sessions for authentication. Enabled by default.
   * @default true
   */
  useSessions?: boolean;
  /**
   * Set to true or pass an object with verification options to require users to verify by email before they are allowed to log into your app.
   * @link https://payloadcms.com/docs/authentication/email#email-verification
   */
}

export type CollectionSlug = string;
export type GlobalSlug = string;

export type GlobalConfig = {
  custom?: Record<string, any>;
  fields: PayloadField[];
  label?: StaticLabel;
};

export declare const validOperators: readonly [
  "equals",
  "contains",
  "not_equals",
  "in",
  "all",
  "not_in",
  "exists",
  "greater_than",
  "greater_than_equal",
  "less_than",
  "less_than_equal",
  "like",
  "not_like",
  "within",
  "intersects",
  "near"
];
export type Operator = (typeof validOperators)[number];
export type JsonValue = JsonArray | JsonObject | unknown;
export type JsonArray = Array<JsonValue>;
export interface JsonObject {
  [key: string]: any;
}
export type WhereField = {
  [key in Operator]?: JsonValue;
};
export type Where = {
  and?: Where[];
  or?: Where[];
  [key: string]: Where[] | WhereField | undefined;
};

export type PayloadFieldType =
  | "array"
  | "blocks"
  | "checkbox"
  | "code"
  | "collapsible"
  | "date"
  | "email"
  | "group"
  | "join"
  | "json"
  | "number"
  | "point"
  | "radio"
  | "relationship"
  | "richText"
  | "row"
  | "select"
  | "tabs"
  | "text"
  | "textarea"
  | "ui"
  | "upload";

export interface PayloadAdminConfig {
  disableBulkEdit?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  components?: {
    Field?: boolean;
  };
}

export interface PayloadHooksConfig {
  beforeValidate?: (null | unknown)[];
  beforeChange?: (null | unknown)[];
  afterRead?: (null | unknown)[];
}

export interface PayloadAccessConfig {
  // You can refine if needed
  [key: string]: unknown;
}

export interface PayloadField {
  name: string;
  type: PayloadFieldType;
  required?: boolean;
  unique?: boolean;
  hidden?: boolean;
  index?: boolean;
  defaultValue?: unknown;
  access?: PayloadAccessConfig;
  admin?: PayloadAdminConfig;
  hooks?: PayloadHooksConfig;

  // for nested structures
  fields?: PayloadField[];

  // for select / radio fields
  options?: Array<
    | string
    | {
        label: string;
        value: string | number;
      }
  >;
}
