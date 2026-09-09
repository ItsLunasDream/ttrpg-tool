/** Schmale Sichten auf die Modelltypen — die E2E-Prüfungen brauchen nicht mehr. */

export type ToolIdLike = string;

export interface MapDocument {
  objects: Record<string, { kind: string; layerId: string; x: number; y: number }>;
  layers: Record<string, { id: string; locked: boolean; name: string }>;
  vtt: {
    walls: Array<{ id: string; type: string; points: number[]; closed: boolean }>;
    portals: Array<{ id: string; closed: boolean; freestanding: boolean }>;
    lights: Array<{ id: string }>;
    notes: Array<{ id: string }>;
  };
}
