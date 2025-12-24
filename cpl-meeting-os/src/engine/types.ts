export type Mode = "new" | "remodel" | "landscape";
export type Priority = "must" | "nice" | "optional" | "locked";
export type Unit = "each" | "sf" | "lf" | "allowance" | "percent";

export interface PoolInputs {
  length: number;
  width: number;
  depthShallow: number;
  depthDeep: number;
}

export interface PoolMetrics {
  perimeter: number;
  surface: number;
  ia: number;
  gallons: number;
  avgDepth: number;
}

export interface ItemOption {
  id: string;
  label: string;
  type: "select" | "toggle" | "qty" | "material";
  choices?: Array<{ id: string; label: string; priceDelta?: number }>;
  min?: number;
  max?: number;
  step?: number;
  unit?: Unit;
  pricePerUnit?: number;
  priceDelta?: number;
}

export interface ItemTemplate {
  id: string;
  name: string;
  sectionId: string;
  unit: Unit;
  basePrice?: number;

  tags?: string[];
  defaultSelected?: boolean;
  defaultQty?: number;
  priorityDefault?: Priority;

  options?: ItemOption[];

  requires?: Array<{
    itemId: string;
    policy: "required" | "recommended";
    reason: string;
    qty?: number;
  }>;

  adjustable?: { kind: "qty"; min: number; max: number; step: number; weight?: number };
}

export interface Section { id: string; name: string; order: number; }

export interface Jurisdiction {
  id: string;
  label: string;
  bullets: string[];
  modifiers?: Record<string, number>;
}

export interface PoolBaseConfig {
  enabled: boolean;
  basePrice: number;
  surfaceThreshold: number;
  surfaceOverage: number;
  perimeterThreshold: number;
  perimeterOverage: number;
  depthThreshold: number;
  depthRate: number;
  note?: string;
  _backup?: Omit<PoolBaseConfig, "_backup"> | null;
}

export interface AppMeta {
  companyName?: string;
  disclaimer?: string;
  nameSuffixTemplates?: string[];
}

export interface Pricebook {
  schemaVersion: number;
  sections: Section[];
  items: ItemTemplate[];
  jurisdictions: Jurisdiction[];
  app?: AppMeta;
  poolBaseConfig?: PoolBaseConfig;
}

export interface Financing {
  termYears: number;
  apr: number;
  downPayment: number;
}

export interface BudgetTarget { type: "total" | "monthly"; value: number; }

export interface Session {
  id: string;
  createdAt: string;
  clientName?: string;
  mode: Mode;
  jurisdictionId?: string;
  financing: Financing;
  pool: PoolInputs;
  poolBaseSelected: boolean;
  items: Record<string, {
    selected?: boolean;
    qty?: number;
    priority?: Priority;
    options?: Record<string, any>;
  }>;
  visionTags: string[];
  constraintsNotes: string[];
  decisionLog: string[];
  followUp?: { dateISO: string; locationPresetId: string; notes?: string };
}

export interface ComputeResult {
  totalLow: number;
  totalHigh: number;
  monthlyLow: number;
  monthlyHigh: number;
  breakdown: {
    poolBase: number;
    items: Array<{ itemId: string; name: string; lineTotal: number; detail?: any }>;
    requirements: Array<{ itemId: string; policy: "required" | "recommended"; reason: string }>;
  };
}
