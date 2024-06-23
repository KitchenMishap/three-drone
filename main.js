import * as THREE from 'three';

import WebGL from 'three/addons/capabilities/WebGL.js';
import { Sky } from 'three/addons/objects/Sky.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 3;
camera.position.y = -10;
camera.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,0), Math.PI/2);
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Green Floor
const planeGeom = new THREE.PlaneGeometry( 1000, 1000 );
const planeMat = new THREE.MeshLambertMaterial( {color: 0x00ff00, side: THREE.FrontSide} );
const plane = new THREE.Mesh( planeGeom, planeMat );
scene.add( plane );

// Cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
const cube = new THREE.Mesh( geometry, material );
cube.position.z = 2
scene.add( cube );

// Sky
const sky = new Sky();
sky.scale.setScalar( 450000 );
const phi = Math.PI/2;
const theta = Math.PI;
const sunPosition = new THREE.Vector3().setFromSphericalCoords( 1, phi, theta );
sky.material.uniforms.sunPosition.value = sunPosition;
scene.add( sky );

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );
// Red directional light at half intensity shining from the top.
var directionalLightRed = new THREE.DirectionalLight( 0xff0000, 0.5 );
directionalLightRed.position.set( 1000,1000,1000 );
scene.add( directionalLightRed );
// Green
var directionalLightGreen = new THREE.DirectionalLight( 0x00ff00, 0.5 );
directionalLightGreen.position.set( 1000,-1000,1000 );
scene.add( directionalLightGreen );
// Green
var directionalLightBlue = new THREE.DirectionalLight( 0x0000ff, 0.5 );
directionalLightBlue.position.set( -1000,-1000,1000 );
scene.add( directionalLightBlue );

if ( WebGL.isWebGLAvailable() ) {
    renderer.setAnimationLoop( animate );
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}

function animate() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}
