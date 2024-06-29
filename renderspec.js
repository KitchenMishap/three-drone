import * as THREE from 'three';

export default addJsonDataToScene;

function addJsonDataToScene(scene) {
    fetch("renderspecs/renderspecquat.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error
                (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(
            (json) => {
                    addAssets(scene, json);
            })
        .catch((error) =>
            console.error("Unable to fetch data:", error));
}

function addAssets(scene, assets) {
    var size = 0.1;
    var cubegeom = new THREE.BoxGeometry(1,1,1);
    const cubematerial = new THREE.MeshMatcapMaterial();
    var count = assets.length;
    var instancedmesh = new THREE.InstancedMesh(cubegeom, cubematerial, count);
    instancedmesh.count = count
    for( var i=0; i< count; i++ ) {
        var sofar = new Object;
        sofar.scale = assets[i].compositeTransform.scale;
        sofar.rotation = assets[i].compositeTransform.quat;
        sofar.position = assets[i].compositeTransform.pos;
        sofar.scale[0] *= size;
        sofar.scale[1] *= size;
        sofar.scale[2] *= size;
        sofar.position[0] *= size;
        sofar.position[1] *= size;
        sofar.position[2] *= size;

        var r = Math.floor(assets[i].asset.r * 255) * 65536;
        var g = Math.floor(assets[i].asset.g * 255) * 256;
        var b = Math.floor(assets[i].asset.b * 255);
        var col = r + g + b;

        var m4 = new THREE.Matrix4;
        var pos = new THREE.Vector3(sofar.position[0], sofar.position[1], sofar.position[2]);
        // Last element is real, as comfirmed in quat_last_is_real_test()
        // (whereas from Python land, first element is real)
        var rot = new THREE.Quaternion(sofar.rotation[1],sofar.rotation[2],sofar.rotation[3], sofar.rotation[0]);
        var scal = new THREE.Vector3(sofar.scale[0], sofar.scale[1], sofar.scale[2]);
        m4.compose(pos,rot,scal);
        instancedmesh.setMatrixAt(i, m4);
        instancedmesh.setColorAt(i, new THREE.Color(col));
    }
    // Now then...
    // From Python land (Unreal Engine), we had X forward, Y right, Z up.
    // Here in three.js we have Z forward, X right, Y up.
    // We'll need to do a rotation
    instancedmesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
    instancedmesh.instanceMatrix.meedsUpdate = true;
    instancedmesh.instanceColor.needsUpdate = true;
    scene.add( instancedmesh )
    console.log("Added instances: ", assets.length);
}

function applyTransforms(transformSoFar, transforms)
{
    for( var i=0; i<transforms.length; i++ )
    {
        applyTransform(transformSoFar, transforms[i]);
    }
}

function applyTransform(transformSoFar, transform) {
    if( transform.name=="ScaleX" )
        transformSoFar.scale.x *= transform.amount;
    if( transform.name=="ScaleY" )
        transformSoFar.scale.y *= transform.amount;
    if( transform.name=="ScaleZ" )
        transformSoFar.scale.z *= transform.amount;
    if( transform.name=="TranslateX")
        transformSoFar.position.x += transform.amount;
    if( transform.name=="TranslateY")
        transformSoFar.position.y += transform.amount;
    if( transform.name=="TranslateZ")
        transformSoFar.position.z += transform.amount;
    if( transform.name=="RotateX") {
        var rot = new THREE.Quaternion;
        rot.setFromAxisAngle(new THREE.Vector3(1, 0, 0), transform.amount * Math.PI / 180);
        var orig = transformSoFar.rotation.clone();
        transformSoFar.rotation.multiplyQuaternions(rot, orig);
        transformSoFar.position.applyQuaternion(rot);
    }
    if( transform.name=="RotateY") {
        var rot = new THREE.Quaternion;
        rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), transform.amount * Math.PI / 180);
        var orig = transformSoFar.rotation.clone();
        transformSoFar.rotation.multiplyQuaternions(rot, orig);
        transformSoFar.position.applyQuaternion(rot);
    }
    if( transform.name=="RotateZ") {
        var rot = new THREE.Quaternion;
        rot.setFromAxisAngle(new THREE.Vector3(0, 0, 1), transform.amount * Math.PI / 180);
        var orig = transformSoFar.rotation.clone();
        transformSoFar.rotation.multiplyQuaternions(rot, orig);
        transformSoFar.position.applyQuaternion(rot);
    }
}
