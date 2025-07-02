<script setup lang="ts">
import TreeVisualizer from "@/components/TreeVisualizer.vue";
import TreeControllerPanel from "@/components/TreeControllerPanel.vue";
import { ref } from "vue";
import { useTreeStore } from "@/stores/treeStore";
import { storeToRefs } from "pinia";
import Panel from "@/components/Panel.vue";
import JsonEditorModal from "@/components/JsonEditorModal.vue";
import { IGoJsNode } from "@/types/gojs/IGoJsNode";

const treeStore = useTreeStore();
const {
  setSelectedNode,
  resetTree,
  setTestTree,
  setTreeNodesAndLinks,
  convertStringJsonToObjectWithBasicValidation,
  prepareDataToExport,
  undo,
  redo,
} = treeStore;

const { treeNodes, treeLinks } = storeToRefs(treeStore);
const isShowJsonEditor = ref<boolean>(false);
const jsonTree = ref<string>("");
const modalMode = ref<"import" | "export">("import");

const handleNodeSelected = (node: IGoJsNode): void => {
  setSelectedNode(node);
};

const handleResetTree = (): void => {
  if (confirm(`Confirm deletion of the entire tree?`)) {
    resetTree();
  }
};

const handleImportModal = (): void => {
  modalMode.value = "import";
  jsonTree.value = "";
  isShowJsonEditor.value = true;
};

const handleExportModal = (): void => {
  modalMode.value = "export";
  let preparedData = prepareDataToExport();
  if (!preparedData) {
    alert("Tree is empty. Nothing to export.");
  } else {
    jsonTree.value = preparedData;
    isShowJsonEditor.value = true;
  }
};

const handleTestTree = () => {
  if (
    confirm(
      `Confirm insertion  of the test tree. You current tree will be deleted!`
    )
  ) {
    setTestTree();
  }
};

const handleImportOrExportConfirm = (
  mode: "import" | "export",
  json: string
): void => {
  if (mode == "export") {
    try {
      navigator.clipboard.writeText(json);
      alert("Copied to clipboard");
      isShowJsonEditor.value = false;
    } catch (err) {
      alert("Failed to copy text to clipboard:");
    }
  }

  if (mode == "import") {
    try {
      let obj = convertStringJsonToObjectWithBasicValidation(json);
      if (obj) {
        setTreeNodesAndLinks(obj?.treeNodes, obj?.treeLinks);
        jsonTree.value = "";
        isShowJsonEditor.value = false;
        alert(
          "Your JSON is valid and imported sucessfully. CLose this modal to see the result"
        );
      }
    } catch (err) {
      alert("Your JSON is invalid");
    }
  }
};

const handleUndo = () => {
  undo();
};

const handleRedo = () => {
  redo();
};
</script>

<template>
  <Panel
    @undo-tree="handleUndo"
    @redo-tree="handleRedo"
    @delete-tree="handleResetTree"
    @generate-tree="handleTestTree"
    @export-tree="handleExportModal"
    @import-tree="handleImportModal" />
  <JsonEditorModal
    :isOpen="isShowJsonEditor"
    @confirm="handleImportOrExportConfirm"
    @close="isShowJsonEditor = false"
    :mode="modalMode"
    :json="jsonTree" />
  <div class="m-[10px] flex flex-col md:flex-row h-[80vh]">
    <div class="p-[10px] flex-grow">
      <TreeVisualizer
        :nodeData="treeNodes"
        :linkData="treeLinks"
        @node-selected="handleNodeSelected" />
    </div>
    <div class="p-[10px] md:w-1/4">
      <TreeControllerPanel />
    </div>
  </div>
</template>

<style scoped></style>
