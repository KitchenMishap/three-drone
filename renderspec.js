import * as THREE from 'three';

export default addJsonDataToScene;

function addJsonDataToScene(scene) {
    fetch("renderspecs/renderspecsub.json")
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
    const cubematerial = new THREE.MeshLambertMaterial();
    var instancedmesh = new THREE.InstancedMesh(cubegeom, cubematerial, assets.length);
    instancedmesh.count = assets.length
    for( var i=0; i< assets.length; i++ ) {
        var sofar = new Object;
        sofar.scale = new THREE.Vector3(1, 1, 1);
        sofar.rotation = new THREE.Quaternion;
        sofar.position = new THREE.Vector3(0, 0, 0);
        applyTransforms(sofar, assets[i].transform);
        sofar.scale.x *= size;
        sofar.scale.y *= size;
        sofar.scale.z *= size;
        sofar.position.x *= size;
        sofar.position.y *= size;
        sofar.position.z *= size;

        var r = Math.floor(assets[i].asset.r * 255) * 65536;
        var g = Math.floor(assets[i].asset.g * 255) * 256;
        var b = Math.floor(assets[i].asset.b * 255);
        var col = r + g + b;

        var m4 = new THREE.Matrix4;
        m4.compose(sofar.position, sofar.rotation, sofar.scale);
        instancedmesh.setMatrixAt(i, m4);
        instancedmesh.setColorAt(i, new THREE.Color(col));
    }
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
