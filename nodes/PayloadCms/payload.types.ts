export interface PayloadCollectionPermissions {
  [collectionSlug: string]: SanitizedCollectionPermission;
}

export interface PayloadGlobalPermissions {
  [globalSlug: string]: SanitizedGlobalPermission;
}

export type SanitizedCollectionPermission = {
  create?: true;
  delete?: true;
  fields: SanitizedFieldsPermissions;
  read?: true;
  readVersions?: true;
  update?: true;
};
export type SanitizedFieldsPermissions =
  | {
      [fieldName: string]: SanitizedFieldPermissions;
    }
  | true;

export type SanitizedFieldPermissions =
  | {
      blocks?: SanitizedBlocksPermissions;
      create: true;
      fields?: SanitizedFieldsPermissions;
      read: true;
      update: true;
    }
  | true;

export type SanitizedBlocksPermissions =
  | {
      [blockSlug: string]: SanitizedBlockPermissions;
    }
  | true;

export type SanitizedBlockPermissions =
  | {
      fields: SanitizedFieldsPermissions;
    }
  | true;

export type SanitizedGlobalPermission = {
  fields: SanitizedFieldsPermissions;
  read?: true;
  readVersions?: true;
  update?: true;
};
