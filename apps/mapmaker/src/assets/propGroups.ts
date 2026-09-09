/** Eine selbst benannte Sammlung aus vorhandenen Props. */
export interface PropGroup {
  id: string;
  name: string;
  /** Prop-Ids, eingebaut oder importiert — ein Prop kann in mehreren Gruppen stecken. */
  propIds: string[];
}
