import * as THREE from 'three';

// Y is UP

import WebGL from 'three/addons/capabilities/WebGL.js';
import { Sky } from 'three/addons/objects/Sky.js';

import addJsonDataToScene from './renderspec.js'
import {quat_last_is_real_test, twos_test} from './test.js'
import Stats from './Stats.js'
import {sortedByScreenArea} from './boundingsphere.js'

// Get the URL parameters
const queryString = window.location.search;
// Get the set of parameters
const urlParams = new URLSearchParams(queryString);
// Check for a blocks= parameter
var maxBlocks=50000;     // Default 100,000 blocks
if( urlParams.has('blocks') )
{
    var blocksString = urlParams.get('blocks');
    if( !isNaN(blocksString) )
    {
        maxBlocks = +blocksString;
    }
}
// Check for a dpg= parameter
var daysPerGroup = 15;
if( urlParams.has('dpg') )
{
    var dpgString = urlParams.get('dpg');
    if( !isNaN(dpgString) )
    {
        daysPerGroup = +dpgString;
    }
}


console.log("Running tests...")
quat_last_is_real_test();
twos_test();
console.log("Tests run.")

const scene = new THREE.Scene();
var stats

// Camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000000 );
camera.position.z = 200;
camera.position.y = 30;

// Renderer
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
div.appendChild(hudCanvas);

// Green Floor
const texture = new THREE.TextureLoader().load( "textures/chess.jpg" );
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 10, 10 );
// I think this plane is xy so we'll have to rotate it by PI/2 to be a floor
const planeGeom = new THREE.PlaneGeometry( 10000, 10000 );
const planeMat = new THREE.MeshLambertMaterial( {color: 0x88ff88} );
planeMat.bumpMap = texture;
const plane = new THREE.Mesh( planeGeom, planeMat );
plane.rotation.x = -Math.PI / 2;
scene.add( plane );

// Cube
var cubeSide = 20;
const geometry = new THREE.BoxGeometry( cubeSide, cubeSide, cubeSide );
const material = new THREE.MeshLambertMaterial();
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

var hiresLoresSphere = [];
var sortedByArea = [];
var frameNum = 0;

var loaded = {};
if ( WebGL.isWebGLAvailable() ) {
    addJsonDataToScene(scene, maxBlocks, daysPerGroup, hiresLoresSphere, sortedByArea, loaded);
    renderer.setAnimationLoop( animate );
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

stats = createStats();
document.body.appendChild( stats.domElement );

function animate() {
    if( loaded.loaded ) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        rotateCamera();
        moveCamera();
        juggleVisible(frameNum);
        renderer.render(scene, camera);
        stats.update();
        frameNum++;
        drawHud();
    }
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

function createStats() {
    stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0';
    stats.domElement.style.top = '0';

    return stats;
}

function juggleVisible(frameNum)
{
    sortedByArea = sortedByScreenArea(camera, hiresLoresSphere, sortedByArea);

    const numToShowHires = 50;
    const numPotentials = hiresLoresSphere.length;
    for( var i=0; i<sortedByArea.length; i++)
    {
        var index = sortedByArea[i].index;
        var area = sortedByArea[i].screenArea;
        var showHires;
        var showLores;
        if(area==0) {
            showHires = false;
            showLores = false;
        } else {
            showHires = (i > (numPotentials - numToShowHires));
            console.log(showHires, area);
            showLores = !showHires;
        }
        hiresLoresSphere[index].hires.visible = showHires;
        hiresLoresSphere[index].lores.visible = showLores;
    }
}

function drawHud()
{
    /*
    var sphere = new THREE.Sphere(new THREE.Vector3(0,20,0),cubeSide);
    var xyr = sphereToScreenCircle(sphere, camera);

    var context = hudCanvas.getContext('2d');
    context.clearRect(0,0,window.innerWidth,window.innerHeight);
    context.beginPath();
    context.arc(xyr.x,xyr.y,xyr.r,0,Math.PI*2,false);
    context.stroke();

    for( var i=0; i<hiresLoresSphere.length; i++ )
    {
        var hi = hiresLoresSphere[i].hires;
        var bs = hi.boundingSphere;
        // Want to rotate by x axis 180 degrees. This is a trial and error hack
        var bs2 = new THREE.Sphere;
        bs2.center.x = bs.center.x;
        bs2.center.y = bs.center.z;
        bs2.center.z = -bs.center.y;
        bs2.radius = bs.radius;
        var box = sphereToScreenRect(bs2, camera);
        context.beginPath();
        context.rect(box.min.x,box.min.y,box.max.x-box.min.x, box.max.y-box.min.y);
        context.stroke();

    }
    */
}
