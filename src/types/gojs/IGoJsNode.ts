export interface IGoJsNode {
  key: number;
  value: string | number;
  color: string;
  annotation?: string;
  leftChildKey?: number | null;
  rightChildKey?: number | null;
  type?: "left" | "right" | null;
  parentNodeKey?: number | null;
}
