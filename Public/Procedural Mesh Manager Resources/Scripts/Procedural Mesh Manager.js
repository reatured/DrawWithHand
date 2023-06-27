// -----JS CODE-----
/** ReadME
 * Four global functions to be called:
 * 1. global.initiateNewMesh(): sceneObject
 *      To start making a new procedural mesh. 
 *      The function returns the sceneObject that contains the procedural mesh. You can parent this to tracked object in the scene
 *      Notice, the erase doesn't work properly when you attach the procedural mesh to a moving scene object. 
 * 2. global.draw(point1, point2)
 *      Adding 2 new points to the mesh. New points are added to the procedural mesh this graph: 
 *      0---2---4---6
 *      |   |   |   |
 *      1---3---5---7
 * 3. global.randomColor()
 *      Randomly change the storke color.
 * 4. global.erase(point1, point2) 
 *      Erase points near the coordinates, as the middle point between point 1 and point 2
 * Limitation:
 * 1. The erase doesn't work properly when you attach the procedural mesh to an moving object in the scene
 * Requirement:
 * 1. Brush Stoke Script is required. 
 */

//****************** Initiate Variables *************

//@input float eraserSize
//@input float miniStrokeSize
//@input int customization {"widget":"combobox", "values":[ {"label":"Texture", "value":0}, {"label":"Color", "value":1}]}
//@input bool randomColor = {true}

//CUSTOMIZE only texture; 
//@ui {"widget":"group_start", "label":"Customize Texture", "showIf":"customization", "showIfValue":0}
//@input Asset.Texture strokeTexture 
//@input Asset.Material textureMaterial 
//@ui {"widget":"group_end"}

//CUSTOMIZE only color
//@ui {"widget":"group_start", "label":"Customize Color", "showIf":"customization", "showIfValue":1}
//@input vec4 strokeColor {"widget":"color",  "showIf":"randomColor", "showIfValue":false}
//@input Asset.Material unlitMaterial 
//@ui {"widget":"group_end"}

//@input float textureWidth
/** @type {number} */
var textureWidth = script.textureWidth;

/** @type {number} */
var eraserSize = script.eraserSize;

/** @type {number} */
var minimunStrokeSize = -script.miniStrokeSize + 1.5;

/** @type {int} */
var customization = script.customization;

/** @type {boolean} */
var randomColor = script.randomColor;

/** @type {Texture} */
var strokeTexture = script.strokeTexture;

/** @type {Material} */
var textureMaterial = script.textureMaterial;

/** @type {vec4} */
var strokeColor = script.strokeColor;

/** @type {Material} */
var unlitMaterial = script.unlitMaterial;

/** @type {Material} */
global.currentMaterial;

switch (customization) {
    case 0:
        //customized texture
        twoSideMaterial(textureMaterial);
        textureMaterial.getPass(0).baseTex = strokeTexture;
        global.currentMaterial = textureMaterial;
        break;
    case 1:
        //customized color
        twoSideMaterial(unlitMaterial);
        unlitMaterial.getPass(0).baseColor = strokeColor;
        var currentColor = unlitMaterial.getPass(0).baseColor;
        global.currentMaterial = unlitMaterial;
        break;
}



function twoSideMaterial(material) {
    material.getPass(0).twoSided = true;
}

//======================================== Procedural Mesh Functions: ========================================

var layer1 = [];
var currentPMeshData = null;

// +++++++++++++++++++++++++++++ Global Functions to be Called 

/**
 * create a new ProceduralMesh object with new mesh builder and saved to layer1 as current mesh. 
 */
global.initiateNewMesh = function() {


    var currentSceObj = global.scene.createSceneObject("brushStroke"); 
    currentSceObj.createComponent("MeshVisual");
    var newMeshB = global.newMesh(currentSceObj, vec4.one());//connect visualRender to meshBuilder

    /** @type {MaterialMeshVisual} */
    var meshVisual = currentSceObj.getComponent("MaterialMeshVisual");
    meshVisual.clearMaterials();
    meshVisual.addMaterial(global.currentMaterial.clone());

    currentPMeshData = new ProceduralMesh(newMeshB, currentSceObj, 2);
    layer1.push(currentPMeshData);

    if (global.parent != null) {
        currentSceObj.setParentPreserveWorldTransform(global.parent);
    }
    return currentSceObj;
};

/**
 * The draw state function. 
 * Update a new poseNode with current finger tip position and call functions in ProceudralMesh. 
 */
global.draw = function(point1, point2) {
    var midPos = point1.add(point2).uniformScale(0.5);
    if (midPos != null) {
        var indexPos = point2;
        var curPosNode = new PoseNode(midPos, indexPos);

        currentPMeshData.addPoint(curPosNode);
    }
};

global.randomColor = function() {

    if (randomColor) {
        currentColor = new vec4(Math.random(), Math.random(), Math.random(), 1);
        global.currentMaterial.getPass(0).baseColor = currentColor;
    }

};

/**
 * Check the distance between finger tip and each poseNode. 
 * If the distance is smaller than the eraser's size, 
 * Divide the array of poseNode in this Procedural Mesh on the node to be deleted. 
 * Create 2 new Procedural Meshes and push to layer1
 * Delete current Proceudural Mesh.
 * Repeat above process until all the Procedural Meshes in layer1 is checked. 
 * Original Mesh: [p1, p2, p3, p4, p5, p6] 
 * Delete p3 and we now have two new: [p1, p2], [p4, p5, p6]
 */
global.erase = function(point1, point2) {
    /** @type {vec3} */
    // var midPos = global.getJointsAveragePosition(["thumb-3", "index-3"]) 
    var midPos = point1.add(point2).uniformScale(0.5);
    if (midPos != null) {
        for (var i = 0; i < layer1.length; i++) {
            var currentPMesh = layer1[i];
            if (checkAndErase(currentPMesh, midPos)) {
                layer1.splice(i, 1);
                i--;
            }
        }
    }
};




// +++++++++++++++++++++++++++++ Helper Functions
function checkAndErase(pMesh, erasePos) {
    for (var i = 0; i < pMesh.pa.length; i++) {
        var dist = erasePos.distance(pMesh.pa[i].centerPos);

        if (dist < eraserSize) {
            pMesh.sceneObj.destroy();
            var p2 = pMesh.pa;              //second half of the mesh
            var p1 = p2.splice(0, i - 1);    //first half of the mesh
            p2.splice(0, 1);                 //The first poseNode in the second half is the poseNode to be deleted. 

            global.currentMaterial.getPass(0).baseColor = pMesh.material.getPass(0).baseColor;

            iterateThroughPA(p1);
            iterateThroughPA(p2);

            return true;
        }
    }
    return false;
}
/**
 * Add all poseNode in p1 to the new (current) Procedural Mesh. 
 * @param {Array} p1 
 */
function iterateThroughPA(p1) {
    if (p1.length > 1) {
        var obj = global.initiateNewMesh();
        if (global.parent != null) {
            obj.setParentPreserveWorldTransform(global.parent);
        }
        
        for (var j = 0; j < p1.length; j++) {
            p1[j].refresh();
            currentPMeshData.addPoint(p1[j]);
        }
    }
}



//********************** Procedural Mesh Class  *******************************/
/**
 * Each time of start draw will create a new procedural mesh
 * After the drawing stops, you won't be able to add new point to this mesh, 
 * Instead, the next time, you will create another procedural mesh and save them to the layer1 array.
 * In procedural mesh is an array of PoseNode objects, which stores many information. 
 * This object also saves it's corresponding sceneobj for changing materials, and mesh builder for erasing.
 * @param {meshBuilder} mBuilder 
 * @param {SceneObject} sceneObj 
 * @param {int} sides 
 */
function ProceduralMesh(mBuilder, sceneObj, sides) {
    this.pa = []; //array of poseNode objects: position array nodes
    this.sides = sides; //How many sides 2 for now. 
    // this.hasHead = hasHead;

    this.meshBuilder = mBuilder;
    this.sceneObj = sceneObj;
    this.material = global.currentMaterial.clone();
    this.minVec3 = null;
    this.maxVec3 = null;

}

// add a poseNode to pa in this object.
ProceduralMesh.prototype.addPoint = function(poseNode) {
    this.pa.push(poseNode);
    global.addNewPt(this.meshBuilder, poseNode);
};

//********************** Pose Node Class  *******************************/
/**
 * 1 PoseNode object will be created each frame with "draw" state
 * It will be saved to the current procedural mesh in layer1 under pa.
 * This object will save center position vec3, corresponding Procedural Mesh object.
 * @param {vec3} centerPos 
 * @param {vec3} indexPos 
 */
function PoseNode(centerPos, indexPos) {
    this.centerPos = centerPos;
    this.radiusVec = indexPos.sub(centerPos);
    this.radiusVec = this.radiusVec.sub(this.radiusVec.clampLength(minimunStrokeSize)); //reduce the size of stroke 
    this.indexPos = centerPos.add(this.radiusVec);
    this.thumbPos = centerPos.sub(this.radiusVec);
    this.pMesh = currentPMeshData;
    this.index = this.pMesh.pa.length - 1;
    this.normal = null;
    this.textureU = this.index / textureWidth;

}

PoseNode.prototype.refresh = function() {
    this.pMesh = currentPMeshData;
    this.index = this.pMesh.pa.length - 1;
    return this;
};





