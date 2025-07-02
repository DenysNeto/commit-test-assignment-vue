


[LIVE DEMO](https://commit-test-assignment-vue.vercel.app/)


Run locally: `npm run dev`







## Short explanation

In project i have used Vue.js version 3 
Tailwind CSS for styling  
Pinia for state managment

Tree visualization using canvas library GoJS. I decided to use library that i was familiar with, because I found build tree structure manually tricky (when this is a lot of children). GoJS library provide control of all the actions as well as handle state and manage model data, but i didn't use this options and manage data through my own store. 


## **important note:**

The data is not stored in the usual tree-like structure. Instead, it’s stored as a flat array — nodes are separate, and the links (connections) are separate. This is because of how data is represented in the GoJS library.

For the import and export task, I didn’t convert the object into a more readable format, because the goal is to import/export JSON, not to make it easy to read.


## **Optional tasks**:

 - Undo/Redo manager 
 - Import/Export  
 - Change color of node + annotations
