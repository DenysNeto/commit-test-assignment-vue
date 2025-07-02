<template>
  <div
    v-if="selectedNode"
    class="border border-gray-700 text-center text-gray-200 h-[80vh] p-[10px] bg-gray-900">
    <h2 class="text-lg font-semibold mb-2 text-white">
      Selected Node <strong>ID:</strong> {{ selectedNode.key }}
    </h2>

    <div class="flex justify-between pt-4 pb-4 items-center">
      <label for="nodeValue" class="font-bold">Value:</label>
      <input
        id="nodeValue"
        type="text"
        v-model="nodeForm.value"
        @input="updateNodeWithFormData"
        :class="[defaultInputClasses]" />
    </div>
    <div class="flex justify-between pt-4 pb-4 items-center">
      <label for="nodeColor" class="font-bold text-gray-300">Color:</label>
      <input
        id="nodeColor"
        type="color"
        v-model="nodeForm.color"
        @change="updateNodeWithFormData"
        :class="[defaultInputClasses]" />
    </div>
    <div class="flex justify-between pt-4 pb-4 items-center">
      <label for="nodeValue" class="font-bold">Annotations:</label>
      <input
        id="nodeAnnotations"
        type="text"
        v-model="nodeForm.annotation"
        @keyup.enter="updateNodeWithFormData"
        :class="[defaultInputClasses]" />
    </div>

    <button
      @click="deleteSelectedNode(selectedNode)"
      :class="[deleteButtonClasses]">
      Delete selected node and its children
    </button>

    <div class="mt-4 my-4 border-t border-gray-600"></div>

    <h2 class="text-lg font-semibold mb-2 text-white">Set Children</h2>

    <h3 for="nodeValue" class="font-bold text-left">
      Left Child ID: {{ selectedNode.leftChildKey }}
    </h3>
    <div
      v-if="selectedNode.leftChildKey"
      class="flex justify-between pt-4 pb-4 items-center">
      <button
        @click="() => deleteSelectedNode(leftChildNode)"
        :class="[deleteButtonClasses]">
        Delete Left Child
      </button>
    </div>
    <div v-else class="pt-4 pb-4 items-center">
      <p class="">Left Child doesn't exist. Create it?</p>
      <button
        @click="() => createChildNode('left')"
        :class="[createButtonClasses]">
        Create Left Child
      </button>
    </div>

    <h3 for="nodeValue" class="font-bold text-left">
      Right Child ID: {{ selectedNode.rightChildKey }}
    </h3>
    <div
      v-if="selectedNode.rightChildKey"
      class="flex justify-between pt-4 pb-4 items-center">
      <button
        @click="() => deleteSelectedNode(rightChildNode)"
        :class="[deleteButtonClasses]">
        > Delete Right Child
      </button>
    </div>
    <div v-else class="pt-4 pb-4 items-center">
      <p class="">Right Child doesn't exist. Create it?</p>
      <button
        @click="() => createChildNode('right')"
        :class="[createButtonClasses]">
        Create Right Child
      </button>
    </div>
  </div>

  <div
    v-else
    class="p-4 border border-gray-700 rounded-lg bg-gray-900 shadow-lg text-gray-200">
    <p class="text-gray-300">
      Select node to edit properties.
      <strong
        >You can generate test tree or import if you don't have any.</strong
      >
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useTreeStore } from "@/stores/treeStore";
import { storeToRefs } from "pinia";
import type { IGoJsNode } from "@/types/gojs/IGoJsNode";

const treeStore = useTreeStore();

const { selectedNode } = storeToRefs(treeStore);
const { deleteNodeAndChildren, updateNode, getChildNodes, createDefaultNode } =
  treeStore;

const nodeForm = ref<IGoJsNode>({
  key: -1000,
  value: "",
  color: "",
  annotation: "",
});

const leftChildNode = ref<IGoJsNode | null>(null);
const rightChildNode = ref<IGoJsNode | null>(null);

const defaultInputClasses =
  "p-2 border border-gray-600 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white placeholder-gray-400 text-white placeholder-gray-400";

const defaultButtonClasses =
  "w-full px-4 py-2  text-white rounded-md cursor-pointer text-sm font-medium transition-colors duration-300 hover:bg-red-700 focus:outline-none focus:ring-2";
const createButtonClasses = `${defaultButtonClasses}  bg-green-600 hover:bg-green-700  focus:ring-green-500`;
const deleteButtonClasses = `${defaultButtonClasses}  bg-red-600 hover:bg-red-700  focus:ring-red-500`;

watch(
  selectedNode,
  (newNode) => {
    if (newNode) {
      nodeForm.value.value = newNode.value || "";
      nodeForm.value.color = newNode.color || "#000000";
      nodeForm.value.annotation = newNode.annotation || "";
      nodeForm.value.key = newNode.key || -1000;
      let childrenArr = getChildNodes(newNode.key);
      if (newNode.leftChildKey) {
        let tempArr = childrenArr.find(
          (node: IGoJsNode) => node.key == newNode.leftChildKey
        );
        if (tempArr) {
          leftChildNode.value = tempArr;
        }
      }
      if (newNode.rightChildKey) {
        let tempArr = childrenArr.find(
          (node: IGoJsNode) => node.key == newNode.rightChildKey
        );
        if (tempArr) {
          rightChildNode.value = tempArr;
        }
      }
    } else {
      nodeForm.value = {
        key: 0,
        value: "",
        color: "",
        annotation: "",
        // leftChildKeyInput: "",
        // rightChildKeyInput: "",
      };
    }
  },
  { immediate: true, deep: true }
);

const createChildNode = (type: "left" | "right"): void => {
  if (!selectedNode.value) {
    console.log("No selected node to create a child for.");
    return;
  }
  createDefaultNode(selectedNode.value, type);
};

const updateNodeWithFormData = () => {
  if (!selectedNode.value) return;
  updateNode(nodeForm.value);
};

const deleteSelectedNode = (nodeToDelete: IGoJsNode | null): void => {
  if (!nodeToDelete) return;

  if (nodeToDelete && nodeToDelete.key) {
    if (
      confirm(
        `Confirm deletion of node with ID: ${nodeToDelete.key} and all children nodes"?`
      )
    ) {
      deleteNodeAndChildren(nodeToDelete);
    }
  }
};
</script>
