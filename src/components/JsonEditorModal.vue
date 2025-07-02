<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      class="bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700">
      <h2 class="text-white text-xl font-bold mb-4">
        {{ mode == "import" ? "Import Data" : "Export Data" }}
      </h2>

      <textarea
        v-model="jsonData"
        :readonly="mode === 'export'"
        class="w-full h-64 p-3 bg-gray-800 text-gray-200 border border-gray-700 rounded-md resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Paste your JSON here or copy the exported JSON..."></textarea>

      <div class="mt-4 flex justify-end space-x-3">
        <button
          @click="() => handleConfirm(mode, jsonData)"
          class="px-5 py-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :class="{
            'bg-blue-600 text-white hover:bg-blue-700': mode === 'import',
            'bg-green-600 text-white hover:bg-green-700': mode === 'export',
          }">
          {{ mode === "import" ? "Import Data" : "Copy to Clipboard" }}
        </button>
        <button
          @click="handleClose"
          class="px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
  mode: "import" | "export";
  json: string;
}>();

const jsonData = ref<string>(props.json);
const emit = defineEmits(["confirm", "close"]);

const handleConfirm = (mode: "import" | "export", json: string) => {
  emit("confirm", mode, json);
};

watch(
  () => props.json,
  (newJson) => {
    jsonData.value = newJson;
  }
);

const handleClose = () => {
  emit("close");
};
</script>
