// -----JS CODE-----
/**
 * This script receive global message from hand gesture detection 
 * Then it calls global functions for drawing. 
 */

//@input SceneObject erasingSphere
/** @type {SceneObject} */
var brushIndicatingSphere = script.erasingSphere;
//@input SceneObject hint
/** @type {SceneObject} */
var hint = script.hint;
//@input Component.MaterialMeshVisual[] handMaterials
/** @type {MaterialMeshVisual} */
var handMaterials = script.handMaterials;


//@input SceneObject parent
/** @type {SceneObject} */
global.parent = script.parent;
global.currentMaterial;

if (global.currentMaterial != null) {
    for (var i = 0; i < handMaterials.length; i++) {
        handMaterials[i].clearMaterials();
        handMaterials[i].addMaterial(global.currentMaterial)
    }

}


//****************** Dealing with global messages; *************
function drawTrigger() {
    //in Procedural Mesh Manager

    global.startDrawing();
}

global.behaviorSystem.addCustomTriggerResponse("pinch_start", drawTrigger)

function drawRelease() {
    //in Procedural Mesh Manager
    global.endDrawing();
}

global.behaviorSystem.addCustomTriggerResponse("pinch_end", drawRelease)


script.api.toggleToDraw = function () {
    if (global.drawingState = global.drawingStates.erase) {
        global.startDrawing();

    }

    if (global.currentMaterial != null) {
        for (var i = 0; i < handMaterials.length; i++) {
            handMaterials[i].clearMaterials();
            handMaterials[i].addMaterial(global.currentMaterial)
        }

    }
    global.behaviorSystem.removeCustomTriggerResponse("pinch_start", eraseTrigger)
    global.behaviorSystem.removeCustomTriggerResponse("pinch_end", eraseRelease)
    global.behaviorSystem.addCustomTriggerResponse("pinch_start", drawTrigger)
    global.behaviorSystem.addCustomTriggerResponse("pinch_end", drawRelease)
}

script.api.toggleToErase = function () {
    if (global.drawingState = global.drawingStates.draw) {

        global.startErasing();
    }
    if (global.currentMaterial != null) {
        for (var i = 0; i < handMaterials.length; i++) {
            handMaterials[i].clearMaterials();
            handMaterials[i].addMaterial(global.currentMaterial)
        }

    }
    global.behaviorSystem.removeCustomTriggerResponse("pinch_start", drawTrigger)
    global.behaviorSystem.removeCustomTriggerResponse("pinch_end", drawRelease)
    global.behaviorSystem.addCustomTriggerResponse("pinch_start", eraseTrigger)
    global.behaviorSystem.addCustomTriggerResponse("pinch_end", eraseRelease)
}

function eraseTrigger() {
    //in Procedural Mesh Manager
    global.startErasing()
}

function eraseRelease() {
    //in Procedural Mesh Manager
    global.endErasing()
}

script.createEvent("UpdateEvent").bind(function (eventData) {

    /** @type {vec3} */
    var midPos = global.getJointsAveragePosition(["index-3", "thumb-3"])
    if (midPos != null) {
        brushIndicatingSphere.getTransform().setWorldPosition(midPos)
        brushIndicatingSphere.getTransform().setLocalScale(new vec3(0.1, 0.1, 0.1))
    }


});

script.api.destroyHint = function () {
    if (hint != null) {
        print(hint)
        hint.destroy();
        hint = null;
    }
}

// ================= Move them here

var isDrawing = false;
var isErasing = false;
global.drawingStates = {
    draw: "draw",
    erase: "erase",
    null: null

};

global.drawingState = null;
script.createEvent("UpdateEvent").bind(function (eventData) {
    var point1 = global.getJointsAveragePosition(["thumb-3"])
    var point2 = global.getJointsAveragePosition(["index-3"])

    if (point1 != null && point2 != null) {
        switch (drawingState) {
            case null:

                break;
            case "draw":
                draw(point1, point2);
                break;

            case "erase":

                erase(point1, point2)
                break;
            default:
                break;
        }

    }

});

global.startDrawing = function () {

    drawingState = drawingStates.draw;
    global.initiateNewMesh();
}

global.endDrawing = function () {
    drawingState = drawingStates.null;
    global.randomColor();
}

global.startErasing = function () {

    drawingState = drawingStates.erase;

}

global.endErasing = function () {

    drawingState = drawingStates.null;
}