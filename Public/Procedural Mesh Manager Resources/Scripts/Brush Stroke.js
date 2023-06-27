// -----JS CODE-----
/**
 * ReadMe
 * 1. You can change this script to achieve more complex brush strokes. 
 * 2. The global function should not be deleted but they can be modified as you want
 * Global functions:
 * 1. global.newMesh()
 *      This defines the mesh builder. You can add more properties to the meshBuilder and you can change the topology.
 * 2. global.addNewPt()
 *      To be called when you want the meshBuilder to render a new poseNode.
 * 3. global.commitPosition:
 *      This is to add a new vertex to the meshBuilder. It will automatically set up UV and normal. 
 *      If you changed the shape of the stroke, you will also need to modify this function.
 */

//reference link: https://docs.snap.com/api/lens-studio/Classes/OtherClasses/#meshbuilder

/** @type {vec4} */
var strokeColor = new vec4(1, 1, 1, 1);

var builder;
var currentMBuilder = null;

/**
 * 
 * @param {SceneObject} meshObj 
 * @param {Color} meshColor 
 * @returns 
 */
global.newMesh = function(meshObj, meshColor) {
    builder = new MeshBuilder([
        { name: "position", components: 3 },
        { name: "color", components: 4 },
        { name: "texture0", components: 2 },
    ]);

    builder.topology = MeshTopology.Triangles;
    builder.indexType = MeshIndexType.UInt16;

    meshObj.getComponent("MeshVisual").mesh = builder.getMesh();

    return builder;
};

/**
 * 
 * @param {meshBuilder} mBuilder 
 * @param {PoseNode} poseNode 
 */
global.addNewPt = function(mBuilder, poseNode) {
    if (mBuilder) {
        currentMBuilder = mBuilder;
        global.commitPostion(poseNode.thumbPos, poseNode.textureU);
        global.commitPostion(poseNode.indexPos, poseNode.textureU);

    }
};

/**
 * Add two vertices for each new poseNode
 * @param {vec3} pos 
 */
global.commitPostion = function(pos, textureU) {

    var totalVectexCount = currentMBuilder.getVerticesCount();
    var v = totalVectexCount % 2;
    var u = textureU;
    currentMBuilder.appendVerticesInterleaved(seperateVec3(pos, strokeColor, u, v));

    if (currentMBuilder.getVerticesCount() > 2) {
        var lastVertexIndex = currentMBuilder.getVerticesCount() - 1;
        if (currentMBuilder.getVerticesCount() % 2 == 0) {
            currentMBuilder.appendIndices([
                lastVertexIndex - 2, lastVertexIndex - 1, lastVertexIndex,
            ]);
        } else {
            currentMBuilder.appendIndices([
                lastVertexIndex, lastVertexIndex - 1, lastVertexIndex - 2,
            ]);
        }
        currentMBuilder.updateMesh();
    }
};

//heler functions: 
function seperateVec3(vec, c, u, v) {

    return [vec.x, vec.y, vec.z, c.x, c.y, c.z, c.w, u, v];

}