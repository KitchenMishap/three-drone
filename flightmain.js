import * as THREE from 'three';

// Y is UP

import WebGL from 'three/addons/capabilities/WebGL.js';
import { Sky } from 'three/addons/objects/Sky.js';
import {sphereToScreenCircle} from './threeto2d.js'

const scene = new THREE.Scene();
const degreesFov = 75;
const nearClipDist = 0.1;
const farClipDist = 10000000;
const camera = new THREE.PerspectiveCamera( degreesFov, window.innerWidth / window.innerHeight, nearClipDist, farClipDist );
camera.position.z = 200;
camera.position.y = 30;
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
var div = document.createElement('div');
document.body.appendChild( div );
div.appendChild( renderer.domElement );

// HUD
var hudCanvas = document.createElement('canvas');
hudCanvas.id = 'hud';
hudCanvas.width = window.innerWidth;
hudCanvas.height = window.innerHeight;
div.appendChild(hudCanvas); // adds the canvas to the body element

// Green Floor
const texture = new THREE.TextureLoader().load( "textures/chess.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 10, 10 );
// I think this plane is xy so we'll have to rotate it by PI/2 to be a floor
const planeGeom = new THREE.PlaneGeometry( 10000, 10000 );
const lightGreen = 0x88ff88;
const planeMat = new THREE.MeshLambertMaterial( {color: lightGreen} );
planeMat.bumpMap = texture;
const planeMesh = new THREE.Mesh( planeGeom, planeMat );
planeMesh.rotation.x = -Math.PI / 2;
scene.add( planeMesh );

// Cube
const cubeSide = 20;
const cubeGeom = new THREE.BoxGeometry( cubeSide, cubeSide, cubeSide );
const cubeMat = new THREE.MeshLambertMaterial();
const cubeMesh = new THREE.Mesh( cubeGeom, cubeMat );
cubeMesh.position.y = 20
scene.add( cubeMesh );

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
// Blue
var directionalLightBlue = new THREE.DirectionalLight( 0x0000ff, 0.5 );
directionalLightBlue.position.set( -1000,1000,1000 );
scene.add( directionalLightBlue );

if ( WebGL.isWebGLAvailable() ) {
    renderer.setAnimationLoop( animateFlight );
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

function animateFlight() {
    cubeMesh.rotation.x += 0.01;
    cubeMesh.rotation.y += 0.01;
    rotateCameraFlight();
    moveCameraFlight();
    renderer.render( scene, camera );
    drawHud();
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
function rotateCameraFlight() {
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

    var bankQuat = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(0,0,1),bank);
    var yawQuat = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(0,1,0),yaw);
    var diveQuat = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(1,0,0),dive);

    var bankDiveQuat = (new THREE.Quaternion).multiplyQuaternions(diveQuat, bankQuat);
    var orientQuat = (new THREE.Quaternion).multiplyQuaternions(yawQuat, bankDiveQuat);

    camera.setRotationFromQuaternion(orientQuat);
}

function moveCameraFlight() {
    var xAxis = new THREE.Vector3(0,0,0);
    var yAxis = new THREE.Vector3(0,0,0);
    var zAxis = new THREE.Vector3(0,0,0);
    camera.matrixWorld.extractBasis(xAxis,yAxis,zAxis);

    var moveForwardBack = dive * 10;
    camera.position.x += zAxis.x * moveForwardBack;
    camera.position.z += zAxis.z * moveForwardBack;
}

function drawHud()
{
    var sphere = new THREE.Sphere(new THREE.Vector3(0,20,0),cubeSide);
    var xyr = sphereToScreenCircle(sphere, camera);

    var context = hudCanvas.getContext('2d');
    context.clearRect(0,0,window.innerWidth,window.innerHeight);
    context.beginPath();
    context.arc(xyr.x,xyr.y,xyr.r,0,Math.PI*2,false);
    context.stroke();
}