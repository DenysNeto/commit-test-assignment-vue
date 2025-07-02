<template>
  <div
    ref="diagramDiv"
    class="border border-gray-700 text-center text-gray-200 h-[80vh]"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import go from "gojs";
import { IGoJsNode } from "@/types/gojs/IGoJsNode";
import { IGoJsLink } from "@/types/gojs/IGoJsLink";

const props = defineProps<{
  nodeData: Array<IGoJsNode>;
  linkData: Array<IGoJsLink>;
}>();

const diagramDiv = ref<HTMLElement | null>(null);
let myDiagram: go.Diagram | null = null;

const emit = defineEmits(["node-selected"]);

const initDiagram = () => {
  if (!diagramDiv.value) {
    throw new Error("Canvas div not found. Cannot initialize GoJS canvas.");
    return;
  }
  const $ = go.GraphObject.make;

  // init canvas
  myDiagram = new go.Diagram(diagramDiv.value, {
    initialAutoScale: go.AutoScale.UniformToFill,

    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 35,
      nodeSpacing: 100,
    }),

    "undoManager.isEnabled": false,
    allowDelete: false,
    allowCopy: false,
    // allowCut: false,
    // allowPaste: false,
    allowMove: false,
    // allowResize: false,
    // allowRelink: false,
    // allowReshape: false,
    // allowGroup: false,
    // allowUngroup: false,
    // allowMultiSelect: false,
  });

  // Build node
  myDiagram.nodeTemplate = $(
    go.Node,
    "Vertical",
    { movable: false },

    $(
      go.TextBlock,
      {
        margin: new go.Margin(0, 0, 2, 0),
        font: "10px sans-serif",
        stroke: "#666",
        alignment: go.Spot.Center,
      },
      new go.Binding("text", "key", (id) => `ID: ${id}`)
    ),
    $(
      go.Panel,
      "Auto",
      $(
        go.Shape,
        "RoundedRectangle",
        { strokeWidth: 0, fill: "lightblue" },
        new go.Binding("fill", "color")
      ),
      $(
        go.TextBlock,
        { margin: 8, font: "14px sans-serif" },
        new go.Binding("text", "value")
      )
    )
  );

  myDiagram.linkTemplate = $(
    go.Link,
    {
      curve: go.Curve.Bezier,
      fromShortLength: -2,
      toShortLength: -2,
      selectable: false,
    },
    $(
      go.Shape,
      { strokeWidth: 1.5 },

      new go.Binding("stroke", "type", (type) =>
        type === "left" ? "blue" : type === "right" ? "red" : "#555"
      ),

      new go.Binding("strokeDashArray", "type", (type) =>
        type === "right" ? [4, 2] : null
      )
    ),
    $(
      go.Shape,
      { toArrow: "Standard", stroke: null },

      new go.Binding("fill", "type", (type) =>
        type === "left" ? "blue" : type === "right" ? "red" : "#555"
      )
    )
  );

  myDiagram.model = new go.GraphLinksModel(props.nodeData, props.linkData);
};

watch(
  () => props.nodeData,
  (newNodeData) => {
    if (myDiagram && myDiagram.model instanceof go.GraphLinksModel) {
      myDiagram.model.nodeDataArray = newNodeData;
    }
  }
);

watch(
  () => props.linkData,
  (newLinkData) => {
    if (myDiagram && myDiagram.model instanceof go.GraphLinksModel) {
      myDiagram.model.linkDataArray = newLinkData;
    }
  }
);

onMounted(() => {
  initDiagram();
  if (myDiagram) {
    myDiagram.addDiagramListener("ChangedSelection", (e) => {
      const selectedNode: go.Node = myDiagram?.selection.first() as go.Node;
      if (selectedNode instanceof go.Node) {
        emit("node-selected", selectedNode.data);
      } else {
        emit("node-selected", null);
      }
    });
  } else {
    console.log("Error while add listener to diagram");
  }
});

onBeforeUnmount(() => {
  if (myDiagram) {
    myDiagram = null;
  }
});
</script>
