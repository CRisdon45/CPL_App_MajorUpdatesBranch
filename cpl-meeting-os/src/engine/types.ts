export type Mode = "new" | "remodel" | "landscape";
export type Priority = "must" | "nice" | "optional" | "locked";
export type Unit = "each" | "sf" | "lf" | "allowance" | "percent";

export interface PackageAction {
  itemId: string;
  selected?: boolean;
  qty?: number;
  options?: Record<string, any>;
}

export interface PackageDefinition {
  id: string;
  name: string;
  mode?: Mode;
  apply?: PackageAction[];
  notes?: string;
}

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
  price?: number; // legacy alias used by starter JSON

  tags?: string[];
  defaultSelected?: boolean;
  selectedByDefault?: boolean; // legacy alias used by starter JSON
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

export interface Section { id: string; name: string; order?: number; }

export interface Jurisdiction {
  id: string;
  label: string;
  bullets: string[];
  modifiers?: Record<string, number>;
}

export interface OfficeLocation {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface WarrantySnippet {
  id: string;
  title: string;
  bullets: string[];
  when?: { anyItems?: string[] };
}

export interface TimelineAdjustment {
  when?: { anyItems?: string[] };
  phase: string;
  deltaDays: number;
  reason?: string;
}

export interface TimelinePhase { id: string; name: string; days: number; }
export interface TimelineTemplate {
  id: string;
  name: string;
  jurisdictions: string[];
  phases: TimelinePhase[];
  adjustments?: TimelineAdjustment[];
}

export interface TimelineDefinition { templates: TimelineTemplate[]; }

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
  quickAdds?: string[];
  packages?: PackageDefinition[];
  offices?: OfficeLocation[];
  warrantySnippets?: WarrantySnippet[];
}

export interface Pricebook {
  schemaVersion: number;
  sections: Section[];
  items: ItemTemplate[];
  jurisdictions: Jurisdiction[];
  app?: AppMeta;
  poolBaseConfig?: PoolBaseConfig;
  timeline?: TimelineDefinition;
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
  followup: { date: string; time: string; officeId: string; notes?: string };
  budgetTarget: { monthly: number; total: number };
  priorities: Record<string, Priority>;
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
    suggestions?: any[];
    timeline?: any;
  };
}
