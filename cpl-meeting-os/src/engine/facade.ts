import type { BudgetTarget, Pricebook, Session, ComputeResult } from "./types";

export type EngineRequest =
  | { type: "compute"; pricebook: Pricebook; session: Session }
  | { type: "budgetSuggest"; pricebook: Pricebook; session: Session; target: BudgetTarget };

export type EngineResponse =
  | { type: "computeResult"; result: ComputeResult }
  | { type: "budgetSuggestResult"; status: "under" | "over" | "close"; delta: number; moves: Array<{ label: string; apply: any; savings: number }> }
  | { type: "error"; message: string };
