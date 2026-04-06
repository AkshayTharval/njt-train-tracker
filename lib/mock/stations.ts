import type { Station } from "@/lib/types";

// Realistic subset of NJT rail stations with their official 2-char codes
export const MOCK_STATIONS: Station[] = [
  { code: "NY", name: "New York Penn Station" },
  { code: "NP", name: "Newark Penn Station" },
  { code: "NB", name: "New Brunswick" },
  { code: "PR", name: "Princeton Junction" },
  { code: "TR", name: "Trenton" },
  { code: "HA", name: "Hamilton" },
  { code: "AB", name: "Aberdeen-Matawan" },
  { code: "LB", name: "Long Branch" },
  { code: "BL", name: "Bay Head" },
  { code: "MT", name: "Metropark" },
  { code: "WF", name: "Westfield" },
  { code: "PL", name: "Plainfield" },
  { code: "SO", name: "South Orange" },
  { code: "MR", name: "Morristown" },
  { code: "DV", name: "Dover" },
  { code: "HV", name: "High Bridge" },
  { code: "SE", name: "Secaucus Upper Level" },
  { code: "HO", name: "Hoboken" },
  { code: "LK", name: "Lakewood" },
  { code: "TK", name: "Tuckahoe" },
];
