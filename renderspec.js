import * as THREE from 'three';
import {stringToFloatArray} from './transportTools.js'

export default addJsonDataToScene;

function addJsonDataToScene(scene, maxAssets, daysPerGroup) {
    fetch("renderspecs/renderspecb64.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error
                (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(
            (json) => {
                    addAssets(scene, json, maxAssets, daysPerGroup);
            })
        .catch((error) =>
            console.error("Unable to fetch data:", error));
}

// maxAssets is now a limit for detail, not overall count
function addAssets(scene, assets, maxAssets, daysPerGroup) {
    var size = 0.1;
    var dayOfGroup = 0;
    var cubegeom = new THREE.BoxGeometry(1,1,1);
    const cubematerial = new THREE.MeshMatcapMaterial();
    var grp = [];
    var grpNum = 0;
    var count = assets.length;
    for( var i=0; i< count; i++ ) {
        if( 'fod' in assets[i] )
        {
            // New day. So is it a new group?
            dayOfGroup++;
            if( dayOfGroup==daysPerGroup )
            {
                // Any group beyond first maxAssets becomes a reduced tetrahedron
                var reduction = 0.1
                var asTri = (i > maxAssets);
                // New group. New instanced mesh. Create, populate and add the current one to the scene
                scene.add(instancedMeshForGroup(grp, cubegeom, cubematerial, asTri, reduction));
                // Start a new group
                grp = [];
                dayOfGroup = 0;
                grpNum++;
            }
        }

        var sofar = new Object;
        sofar.scale = stringToFloatArray(assets[i].trans.s);
        sofar.rotation = stringToFloatArray(assets[i].trans.q);
        sofar.position = stringToFloatArray(assets[i].trans.p);
        sofar.scale[0] *= size;
        sofar.scale[1] *= size;
        sofar.scale[2] *= size;
        sofar.position[0] *= size;
        sofar.position[1] *= size;
        sofar.position[2] *= size;

        var col = Math.floor(assets[i].asset.rgba / 256);

        var m4 = new THREE.Matrix4;
        var pos = new THREE.Vector3(sofar.position[0], sofar.position[1], sofar.position[2]);
        // Last element is real, as comfirmed in quat_last_is_real_test()
        // (whereas from Python land, first element is real)
        var rot = new THREE.Quaternion(sofar.rotation[1],sofar.rotation[2],sofar.rotation[3], sofar.rotation[0]);
        var scal = new THREE.Vector3(sofar.scale[0], sofar.scale[1], sofar.scale[2]);
        m4.compose(pos,rot,scal);
        // Store in the group array for now (gets copied into an instancedmesh once we know how many)
        var item = new Object();
        item.m4 = m4;
        item.col = col;
        grp.push(item);
    }

    // Create instanced mesh for the current (final) group
    scene.add(instancedMeshForGroup(grp, cubegeom, cubematerial, false, reduction));

    console.log("Added instances: ", assets.length);
}

function instancedMeshForGroup(grp, cubegeom, cubematerial, asTri, reduction )
{
    var grpCount = grp.length;
    var instancedmesh = new THREE.InstancedMesh(cubegeom, cubematerial, grpCount);
    instancedmesh.count = grpCount
    for( var j = 0; j<grpCount; j++)
    {
        instancedmesh.setMatrixAt(j, grp[j].m4);
        instancedmesh.setColorAt(j, new THREE.Color(grp[j].col));
    }
    // Now then...
    // From Python land (Unreal Engine), we had X forward, Y right, Z up.
    // Here in three.js we have Z forward, X right, Y up.
    // We'll need to do a rotation
    instancedmesh.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), -Math.PI/2);
    instancedmesh.instanceMatrix.meedsUpdate = true;
    instancedmesh.instanceColor.needsUpdate = true;

    if( asTri )
    {
        instancedmesh.computeBoundingSphere();
        var sph = instancedmesh.boundingSphere;
        const geometry = new THREE.TetrahedronGeometry(sph.radius * reduction);
        const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
        var mesh = new THREE.Mesh( geometry, material );
        // Want to rotate by x axis 180 degrees. This is a trial and error hack
        mesh.position.set(sph.center.x, sph.center.z, -sph.center.y);
        return mesh;
    }
    else
    {
        return instancedmesh;
    }
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
