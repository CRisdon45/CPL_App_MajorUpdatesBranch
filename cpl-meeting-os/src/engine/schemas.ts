import { z } from "zod";

export const ZUnit = z.enum(["each", "sf", "lf", "allowance", "percent"]);

export const ZItemOption = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["select", "toggle", "qty", "material"]),
  choices: z.array(z.object({
    id: z.string(),
    label: z.string(),
    priceDelta: z.number().optional()
  })).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  unit: ZUnit.optional(),
  pricePerUnit: z.number().optional(),
  priceDelta: z.number().optional()
});

export const ZItemTemplate = z.object({
  id: z.string(),
  name: z.string(),
  sectionId: z.string(),
  unit: ZUnit,
  basePrice: z.number().optional(),
  price: z.number().optional(), // legacy alias
  tags: z.array(z.string()).optional(),
  defaultSelected: z.boolean().optional(),
  selectedByDefault: z.boolean().optional(), // legacy alias
  defaultQty: z.number().optional(),
  priorityDefault: z.enum(["must","nice","optional","locked"]).optional(),
  options: z.array(ZItemOption).optional(),
  requires: z.array(z.object({
    itemId: z.string(),
    policy: z.enum(["required","recommended"]),
    reason: z.string(),
    qty: z.number().optional()
  })).optional(),
  adjustable: z.object({
    kind: z.literal("qty"),
    min: z.number(),
    max: z.number(),
    step: z.number(),
    weight: z.number().optional()
  }).optional()
});

export const ZSection = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number().optional()
});

export const ZJurisdiction = z.object({
  id: z.string(),
  label: z.string(),
  bullets: z.array(z.string()),
  modifiers: z.record(z.number()).optional()
});

const ZPoolBaseConfigNoBackup = z.object({
  enabled: z.boolean(),
  basePrice: z.number(),
  surfaceThreshold: z.number(),
  surfaceOverage: z.number(),
  perimeterThreshold: z.number(),
  perimeterOverage: z.number(),
  depthThreshold: z.number(),
  depthRate: z.number(),
  note: z.string().optional()
});

export const ZPricebook = z.object({
  schemaVersion: z.number(),
  sections: z.array(ZSection),
  items: z.array(ZItemTemplate),
  jurisdictions: z.array(ZJurisdiction),
  app: z.object({
    companyName: z.string().optional(),
    disclaimer: z.string().optional(),
    nameSuffixTemplates: z.array(z.string()).optional(),
    quickAdds: z.array(z.string()).optional(),
    packages: z.array(z.object({
      id: z.string(),
      name: z.string(),
      mode: z.enum(["new","remodel","landscape"]).optional(),
      notes: z.string().optional(),
      apply: z.array(z.object({
        itemId: z.string(),
        selected: z.boolean().optional(),
        qty: z.number().optional(),
        options: z.record(z.any()).optional()
      })).optional()
    })).optional(),
    offices: z.array(z.object({
      id: z.string(),
      name: z.string(),
      address: z.string().optional(),
      phone: z.string().optional()
    })).optional(),
    warrantySnippets: z.array(z.object({
      id: z.string(),
      title: z.string(),
      bullets: z.array(z.string()),
      when: z.object({
        anyItems: z.array(z.string()).optional()
      }).optional()
    })).optional()
  }).optional(),
  poolBaseConfig: ZPoolBaseConfigNoBackup.extend({
    _backup: ZPoolBaseConfigNoBackup.nullable().optional()
  }).optional(),
  timeline: z.object({
    templates: z.array(z.object({
      id: z.string(),
      name: z.string(),
      jurisdictions: z.array(z.string()),
      phases: z.array(z.object({
        id: z.string(),
        name: z.string(),
        days: z.number()
      })),
      adjustments: z.array(z.object({
        when: z.object({
          anyItems: z.array(z.string()).optional()
        }).optional(),
        phase: z.string(),
        deltaDays: z.number(),
        reason: z.string().optional()
      })).optional()
    }))
  }).optional()
});
