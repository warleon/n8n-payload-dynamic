import { INodePropertyOptions } from "n8n-workflow";
import { PayloadField } from "./payload.types";

export function payloadField2N8nOption(
  field: PayloadField,
  parentName = ""
): INodePropertyOptions[] {
  const prefix = parentName ? `${parentName}.` : "";

  switch (field.type) {
    case "select":
    case "radio":
      return (
        field.options?.map(
          (opt: any): INodePropertyOptions => ({
            name: `${prefix}${field.name}: ${
              typeof opt === "string" ? opt : opt.label ?? String(opt.value)
            }`,
            value: typeof opt === "string" ? opt : opt.value,
          })
        ) || []
      );

    case "checkbox":
      return [
        { name: `${prefix}${field.name}: True`, value: true },
        { name: `${prefix}${field.name}: False`, value: false },
      ];

    case "point":
      return [
        { name: `${prefix}${field.name}.lat`, value: "lat" },
        { name: `${prefix}${field.name}.lng`, value: "lng" },
      ];

    case "array":
    case "group":
    case "row":
    case "tabs":
    case "blocks":
      return (field.fields || []).flatMap((subField) =>
        payloadField2N8nOption(subField, `${prefix}${field.name}`)
      );

    default:
      return [
        {
          name: `${prefix}${field.name}`,
          value: field.name,
        },
      ];
  }
}
