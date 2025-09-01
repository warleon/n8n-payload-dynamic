export interface PayloadCollection {
  slug: string;
  labels?: {
    singular: string;
    plural: string;
  };
  fields?: any[];
  auth?: boolean;
}

export interface PayloadGlobal {
  slug: string;
  label?: string;
  fields?: any[];
}
