import * as THREE from 'three';

import WebGL from 'three/addons/capabilities/WebGL.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

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

camera.position.z = 5;

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
