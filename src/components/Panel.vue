<template>
  <header class="bg-gray-900 p-4 shadow-md flex justify-between items-center">
    <div class="space-x-4">
      <button @click="emit('undo-tree')" :class="[setButtonClasses('red')]">
        <- Undo
      </button>
      <button @click="emit('redo-tree')" :class="[setButtonClasses('green')]">
        Redo ->
      </button>
    </div>

    <div class="space-x-4">
      <button
        @click="emit('import-tree')"
        :class="[setButtonClasses('purple')]">
        Import
      </button>
      <button
        @click="emit('export-tree')"
        :class="[setButtonClasses('purple')]">
        Export
      </button>
      <button
        @click="emit('generate-tree')"
        :class="[setButtonClasses('green')]">
        Generate Test Tree
      </button>
      <button @click="emit('delete-tree')" :class="[setButtonClasses('red')]">
        Delete Tree
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
const defaultButtonClasses =
  "px-4 py-2 text-white rounded-md  transition-colors duration-200  focus:ring-opacity-50 focus:ring-opacity-50  ";

const setButtonClasses = (color: string) => {
  return `${defaultButtonClasses} bg-${color}-600 hover:bg-${color}-700 focus:ring-${color}-500`;
};
//

const emit = defineEmits([
  "import-tree",
  "export-tree",
  "generate-tree",
  "delete-tree",
  "undo-tree",
  "redo-tree",
]);
</script>

<style scoped></style>
