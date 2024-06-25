import * as THREE from 'three';

// Y is UP

import WebGL from 'three/addons/capabilities/WebGL.js';
import { Sky } from 'three/addons/objects/Sky.js';

import addJsonDataToScene from './renderspec.js'

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000000 );
camera.position.z = 200;
camera.position.y = 30;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Green Floor
const texture = new THREE.TextureLoader().load( "textures/chess.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 10, 10 );
// I think this plane is xy so we'll have to rotate it by PI/2 to be a floor
const planeGeom = new THREE.PlaneGeometry( 10000, 10000 );
const planeMat = new THREE.MeshLambertMaterial( {color: 0x88ff88, side: THREE.BothSides} );
planeMat.bumpMap = texture;
const plane = new THREE.Mesh( planeGeom, planeMat );
plane.rotation.x = -Math.PI / 2;
scene.add( plane );

// Cube
const geometry = new THREE.BoxGeometry( 20, 20, 20 );
const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
const cube = new THREE.Mesh( geometry, material );
cube.position.y = 20
scene.add( cube );

// Sky
const sky = new Sky();
sky.scale.setScalar( 450000 );
sky.material.uniforms.sunPosition.value = new THREE.Vector3(1,0,0 );
sky.material.uniforms.up.value = new THREE.Vector3(0,1,0);
scene.add( sky );

// Ambient light
const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// Red, green, blue directional lights at half intensity shining from various positions above
var directionalLightRed = new THREE.DirectionalLight( 0xff0000, 0.5 );
directionalLightRed.position.set( 1000,1000,1000 );
scene.add( directionalLightRed );
// Green
var directionalLightGreen = new THREE.DirectionalLight( 0x00ff00, 0.5 );
directionalLightGreen.position.set( 1000,1000,-1000 );
scene.add( directionalLightGreen );
// Green
var directionalLightBlue = new THREE.DirectionalLight( 0x0000ff, 0.5 );
directionalLightBlue.position.set( -1000,1000,1000 );
scene.add( directionalLightBlue );

if ( WebGL.isWebGLAvailable() ) {
    addJsonDataToScene(scene);
    renderer.setAnimationLoop( animate );
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    rotateCamera();
    moveCamera();
    renderer.render( scene, camera );
}

var mouseScaledX = 0;
var mouseScaledY = 0;
window.onmousemove = function(event) {
    var sizeX = window.innerWidth;
    var sizeY = window.innerHeight;
    var relX = event.clientX - sizeX/2;
    var relY = event.clientY - sizeY/2;
    mouseScaledX = relX / (sizeX/2);
    mouseScaledY = relY / (sizeY/2);
}

var bank = 0;
var dive = 0;
var yaw = 0;
function rotateCamera() {
    var targetBank = -mouseScaledX * 0.5;
    var bankSpeed = targetBank - bank;
    bank += bankSpeed * 0.1;

    var targetDive = mouseScaledY * 0.2;
    var diveSpeed = targetDive - dive;
    dive += diveSpeed * 0.1;

    yaw += targetBank * 0.04;
    if( yaw < 0 )
        yaw += Math.PI * 2;
    if( yaw > Math.PI * 2)
        yaw -= Math.PI * 2;

    var identityQuat = (new THREE.Quaternion).identity();
    var bankQuat = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(0,0,1),bank);
    var yawQuat = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(0,1,0),yaw);
    var diveQuat = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(1,0,0),dive);

    var bankDiveQuat = (new THREE.Quaternion).multiplyQuaternions(diveQuat, bankQuat);
    var orientQuat = (new THREE.Quaternion).multiplyQuaternions(yawQuat, bankDiveQuat);

    camera.setRotationFromQuaternion(orientQuat);
}

function moveCamera() {
    var xAxis = new THREE.Vector3(0,0,0);
    var yAxis = new THREE.Vector3(0,0,0);
    var zAxis = new THREE.Vector3(0,0,0);
    camera.matrixWorld.extractBasis(xAxis,yAxis,zAxis);

    var moveForwardBack = dive * 10;
    camera.position.x += zAxis.x * moveForwardBack;
    camera.position.z += zAxis.z * moveForwardBack;
}
