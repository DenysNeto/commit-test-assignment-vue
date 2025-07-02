import { ref, watch, type Ref, nextTick } from "vue";
import type { IGoJsNode } from "@/types/gojs/IGoJsNode";
import type { IGoJsLink } from "@/types/gojs/IGoJsLink";

interface ITreeState {
  treeNodes: IGoJsNode[];
  treeLinks: IGoJsLink[];
}

export function useUndoRedoManager(
  nodesRef: Ref<IGoJsNode[]>,
  linksRef: Ref<IGoJsLink[]>,
  localStorageSaveAction: () => void
) {
  const history = ref<ITreeState[]>([]);
  const nextStep = ref<ITreeState[]>([]);
  const isPerformingUndoRedo = ref(false);

  const setHistoryPoint = () => {
    if (isPerformingUndoRedo.value) return;
    // nextStep.value = [];
    history.value.push({
      treeNodes: [...nodesRef.value],
      treeLinks: [...linksRef.value],
    });
    if (history.value.length > 50) {
      history.value.shift();
    }
  };

  const applyState = (state: ITreeState) => {
    isPerformingUndoRedo.value = true;
    nodesRef.value = state.treeNodes;
    linksRef.value = state.treeLinks;

    nextTick(() => {
      isPerformingUndoRedo.value = false;
    });
  };

  const undo = () => {
    if (history.value.length > 1) {
      const currentState = history.value.pop();
      history.value = [...history.value];
      currentState && nextStep.value.push(currentState);
      const previousState = history.value[history.value.length - 1];
      applyState(previousState);
    } else {
      alert("No undo steps available");
    }
  };

  const redo = () => {
    if (nextStep.value.length > 0) {
      const nextState = nextStep.value.pop()!;

      history.value.push(nextState);
      applyState(nextState);
    } else {
      alert("No redo steps available");
    }
  };

  watch(
    [nodesRef, linksRef],
    () => {
      if (!isPerformingUndoRedo.value) {
        setHistoryPoint();
        localStorageSaveAction();
      }
    },
    { deep: true }
  );

  return {
    undo,
    redo,
    setHistoryPoint,
  };
}
