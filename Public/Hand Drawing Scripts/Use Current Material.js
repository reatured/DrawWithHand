// -----JS CODE-----
//@input Component.MaterialMeshVisual thisMesh
/** @type {MaterialMeshVisual} */
var thisMesh = script.thisMesh;
if (global.currentMaterial != null) {
    thisMesh.clearMaterials();
    thisMesh.addMaterial(global.currentMaterial)
}



