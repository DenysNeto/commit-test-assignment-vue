import { defineStore } from "pinia";
import { ref } from "vue";
import type { IGoJsNode } from "@/types/gojs/IGoJsNode";
import type { IGoJsLink } from "@/types/gojs/IGoJsLink";
import { useUndoRedoManager } from "@/composables/useUndoRedoManager";

export const useTreeStore = defineStore("tree", () => {
  const LOCAL_STORAGE_TREE_DATA_KEY = "treeData";

  const treeNodes = ref<IGoJsNode[]>([]);

  const treeLinks = ref<IGoJsLink[]>([]);

  const selectedNode = ref<IGoJsNode | null>(null);

  const { undo, redo, setHistoryPoint } = useUndoRedoManager(
    treeNodes,
    treeLinks,
    saveTreeDataToLocatStorage
  );

  if (!loadTreeDataFromLocalStorage()) {
    setTestTree();
  }

  function saveTreeDataToLocatStorage() {
    try {
      const dataToSave = {
        treeNodes: [...treeNodes.value],
        treeLinks: [...treeLinks.value],
      };
      localStorage.setItem(
        LOCAL_STORAGE_TREE_DATA_KEY,
        JSON.stringify(dataToSave)
      );
    } catch (e) {
      console.log("Error saving to local storage:", e);
    }
  }

  const deleteNodeAndChildren = (nodeToDelete: IGoJsNode | null): void => {
    let copyTreeNodes: Array<IGoJsNode> = [...treeNodes.value];
    let copyTreeLinks: Array<IGoJsLink> = [...treeLinks.value];

    const deleteNode = (nodeToDelete: IGoJsNode | null): void => {
      if (!nodeToDelete) return;
      copyTreeNodes = copyTreeNodes.filter(
        (node) => node.key !== nodeToDelete.key
      );
      copyTreeLinks = copyTreeLinks.filter(
        (link) => link.from !== nodeToDelete.key && link.to !== nodeToDelete.key
      );

      if (nodeToDelete.leftChildKey) {
        let leftChildNode = copyTreeNodes.find(
          (el) => el.key == nodeToDelete.leftChildKey
        );
        if (leftChildNode) deleteNode(leftChildNode);
      }

      if (nodeToDelete.rightChildKey) {
        let rightChildNode = treeNodes.value.find(
          (el) => el.key == nodeToDelete.rightChildKey
        );
        if (rightChildNode) deleteNode(rightChildNode);
      }
    };

    deleteNode(nodeToDelete);
    copyTreeNodes = copyTreeNodes.map((node) => {
      if (node.key == nodeToDelete?.parentNodeKey) {
        nodeToDelete.type == "left"
          ? (node.leftChildKey = null)
          : (node.rightChildKey = null);
        setSelectedNode(node);
      }
      return node;
    });

    treeNodes.value = [...copyTreeNodes];
    treeLinks.value = [...copyTreeLinks];
    setSelectedNode(selectedNode.value);
  };

  const updateNode = (newObj: IGoJsNode): void => {
    treeNodes.value = treeNodes.value.map((node: IGoJsNode) => {
      if (node.key === newObj.key) {
        return { ...node, ...newObj };
      }
      return node;
    });
  };

  function resetTree(): void {
    treeNodes.value = [];
    treeLinks.value = [];
    selectedNode.value = null;
  }

  const setTreeNodesAndLinks = (
    treeNodesNew: IGoJsNode[],
    treeLinksNew: IGoJsLink[]
  ): void => {
    treeNodes.value = [...treeNodesNew];
    treeLinks.value = [...treeLinksNew];
    selectedNode.value = null;
  };

  const setSelectedNode = (node: IGoJsNode | null): void => {
    if (!node) {
      console.log("No node to be selected");
    }
    selectedNode.value = node;
  };

  const createDefaultNode = (
    parentNode: IGoJsNode,
    type: "left" | "right"
  ): void => {
    if (!parentNode || !parentNode.key) return;
    if (parentNode.leftChildKey && type == "left") {
      console.log("Node already has left child");
      return;
    }
    if (parentNode.rightChildKey && type == "right") {
      console.log("Node already has right child");
      return;
    }

    const newKey =
      treeNodes.value.length > 0
        ? Math.max(...treeNodes.value.map((el) => el.key)) + 1
        : 1;

    const nodeDefaultProprerties: IGoJsNode = {
      type: type,
      parentNodeKey: parentNode.key,
      annotation: `${type} child of ${parentNode.key}`,
      value: `New Node ${type}`,
      color: "green",
      key: newKey,
    };

    treeNodes.value.push(nodeDefaultProprerties);
    treeLinks.value.push({ from: parentNode.key, to: newKey, type });
    treeLinks.value = [...treeLinks.value];

    type === "left"
      ? (parentNode.leftChildKey = newKey)
      : (parentNode.rightChildKey = newKey);
    updateNode(parentNode);
  };

  const getChildNodes = (parentNodeKey: string | number): IGoJsNode[] => {
    const childLinkKeys = treeLinks.value
      .filter((link) => link.from === parentNodeKey)
      .map((link) => link.to);

    return treeNodes.value.filter((node) => childLinkKeys.includes(node.key));
  };

  function convertStringJsonToObjectWithBasicValidation(
    value: string
  ): { treeNodes: Array<IGoJsNode>; treeLinks: Array<IGoJsLink> } | undefined {
    try {
      const parsedValue = JSON.parse(value);
      if (typeof parsedValue !== "object" || parsedValue === null) {
        throw new Error("Invalid JSON");
      }
      let keysArr: Array<string> = Object.keys(parsedValue);
      let checkKeys: boolean =
        keysArr.includes("treeNodes") && keysArr.includes("treeLinks");
      let checkIsArray: boolean =
        Array.isArray(parsedValue.treeNodes) &&
        Array.isArray(parsedValue.treeLinks);
      if (checkKeys && checkIsArray) {
        return parsedValue;
      }
    } catch (err: any) {
      throw new Error("Invalid JSON", err);
    }
  }

  function prepareDataToExport(): string | undefined {
    try {
      let obj = { treeNodes: treeNodes.value, treeLinks: treeLinks.value };
      return JSON.stringify(obj);
    } catch (err: any) {}
  }

  function setTestTree(): void {
    treeNodes.value = [
      {
        key: 1,
        annotation: "Root",
        color: "lightblue",
        value: "Root Value",
        parentNodeKey: null,
        leftChildKey: 2,
        rightChildKey: 3,
        type: null,
      },
      {
        key: 2,
        annotation: "Child 1",
        color: "lightgreen",
        value: "Child 1 Value",
        parentNodeKey: 1,
        leftChildKey: 4,
        rightChildKey: 5,
        type: "left",
      },
      {
        key: 3,
        annotation: "Child 2",
        color: "lightcoral",
        value: "Child 2 Value",
        parentNodeKey: 1,
        leftChildKey: 6,
        rightChildKey: null,
        type: "right",
      },
      {
        key: 4,
        annotation: "Grandchild 1",
        color: "lightyellow",
        value: "Grandchild 1 Value",
        parentNodeKey: 2,
        leftChildKey: 7,
        rightChildKey: null,
        type: "left",
      },
      {
        key: 5,
        annotation: "Grandchild 2",
        color: "lightgray",
        value: "Grandchild 2 Value",
        parentNodeKey: 2,
        leftChildKey: null,
        rightChildKey: null,
        type: "right",
      },
      {
        key: 6,
        annotation: "Grandchild 3",
        color: "lightpink",
        value: "Grandchild 3 Value",
        parentNodeKey: 3,
        leftChildKey: null,
        rightChildKey: null,
        type: "left",
      },
      {
        key: 7,
        annotation: "Great-Grandchild 1",
        color: "lightsalmon",
        value: "Great-Grandchild 1 Value",
        parentNodeKey: 4,
        leftChildKey: null,
        rightChildKey: null,
        type: "left",
      },
    ];
    treeLinks.value = [
      { from: 1, to: 2, type: "left" },
      { from: 1, to: 3, type: "right" },
      { from: 2, to: 4, type: "left" },
      { from: 2, to: 5, type: "right" },
      { from: 3, to: 6, type: "left" },
      { from: 4, to: 7, type: "left" },
    ];
  }

  function loadTreeDataFromLocalStorage(): boolean {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_TREE_DATA_KEY);
      if (data) {
        const parsedData = convertStringJsonToObjectWithBasicValidation(data);
        if (parsedData) {
          treeNodes.value = parsedData.treeNodes;
          treeLinks.value = parsedData.treeLinks;
          setHistoryPoint();
          return true;
        } else {
          console.warn(
            "Invalid data in local storage. Starting with default tree."
          );
          resetTree();
          return false;
        }
      }
    } catch (e) {
      console.error("Error loading from local storage:", e);
      resetTree();
      return false;
    }
    return false;
  }

  return {
    undo,
    redo,
    treeNodes,
    treeLinks,
    selectedNode,
    setSelectedNode,
    updateNode,
    deleteNodeAndChildren,
    getChildNodes,
    createDefaultNode,
    resetTree,
    setTestTree,
    convertStringJsonToObjectWithBasicValidation,
    setTreeNodesAndLinks,
    prepareDataToExport,
  };
});
