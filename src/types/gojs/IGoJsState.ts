import { IGoJsLink } from "./IGoJsLink";
import { IGoJsNode } from "./IGoJsNode";

export interface IGoJsState {
  treeNodes: Array<IGoJsNode>;
  linkNodes: Array<IGoJsLink>;
}
