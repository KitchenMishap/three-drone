import * as THREE from 'three';

export default addJsonDataToScene;

function addJsonDataToScene(scene) {
    fetch("renderspecs/renderspec100MB.json")
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
    var grp = new THREE.Group;
    for( var i=0; i< assets.length; i++ ) {
        var sofar = new Object;
        sofar.scale = new THREE.Vector3(1, 1, 1);
        sofar.rotation = new THREE.Quaternion;
        sofar.rotation.identity;
        sofar.position = new THREE.Vector3(0, 0, 0);
        applyTransforms(sofar, assets[i].transform);
        applyTransforms(sofar, assets[i].transform);

        //console.log(sofar.scale);
        var mult = 0.01;
        const geometry = new THREE.BoxGeometry(mult * sofar.scale.x, mult * sofar.scale.y, mult * sofar.scale.z);
        var r = Math.floor(assets[i].asset.r * 255) * 65536;
        var g = Math.floor(assets[i].asset.g * 255) * 256;
        var b = Math.floor(assets[i].asset.b * 255);
        var col = r + g + b;
        const material = new THREE.MeshLambertMaterial({color: col});
        const cube = new THREE.Mesh(geometry, material);

        cube.setRotationFromQuaternion(sofar.rotation);     // This DOESNT WORK
        cube.position.set(mult * sofar.position.x, mult * sofar.position.y, mult * sofar.position.z);

        grp.add(cube);
    }
    scene.add( grp );
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
        transformSoFar.scale.z *= transform.amount;
    if( transform.name=="ScaleZ" )
        transformSoFar.scale.y *= transform.amount;
    if( transform.name=="TranslateX")
        transformSoFar.position.x += transform.amount;
    if( transform.name=="TranslateY")
        transformSoFar.position.z += transform.amount;
    if( transform.name=="TranslateZ")
        transformSoFar.position.y += transform.amount;
    if( transform.name=="RotateX") {
        var rot = new THREE.Quaternion;
        rot.setFromAxisAngle(new THREE.Vector3(1, 0, 0), transform.amount * Math.PI / 180);
        transformSoFar.rotation.premultiply(rot);
        transformSoFar.position.applyQuaternion(rot);
    }
    // Y and Z are swapped due to difference between unreal and three.js
    if( transform.name=="RotateY") {
        var rot = new THREE.Quaternion;
        rot.setFromAxisAngle(new THREE.Vector3(0, 0, 1), transform.amount * Math.PI / 180);
        transformSoFar.rotation.premultiply(rot);
        transformSoFar.position.applyQuaternion(rot);
    }
    if( transform.name=="RotateZ") {
        var rot = new THREE.Quaternion;
        rot.setFromAxisAngle(new THREE.Vector3(0, 1, 0), transform.amount * Math.PI / 180);
        transformSoFar.rotation.premultiply(rot);
        transformSoFar.position.applyQuaternion(rot);
    }
}
