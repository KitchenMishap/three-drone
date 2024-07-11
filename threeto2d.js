import * as THREE from 'three';

export function sphereToScreenCircle(sphere, camera)
{
    var widthHalf = 0.5*window.innerWidth;
    var heightHalf = 0.5*window.innerHeight;

    var vector = new THREE.Vector3(sphere.center.x, sphere.center.y, sphere.center.z);
    var vectorRight =  rightOfPointOnScreen(vector, camera, sphere.radius);

    vector.project(camera);
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    vectorRight.project(camera);
    vectorRight.x = ( vectorRight.x * widthHalf ) + widthHalf;
    vectorRight.y = - ( vectorRight.y * heightHalf ) + heightHalf;

    var r= vectorRight.x - vector.x;

    return {
        x: vector.x,
        y: vector.y,
        r: r < 0 ? 0 : r
    };
}

export function rightOfPointOnScreen(point, camera, radius3d) {
    console.log(radius3d);
    var cameraLocalRight = new THREE.Vector3(1, 0, 0);
    console.log(cameraLocalRight);
    cameraLocalRight.multiplyScalar(radius3d);
    console.log(cameraLocalRight);
    var cameraWorldRight = camera.localToWorld(cameraLocalRight);
    cameraWorldRight.sub(camera.position);

    var objectPosition = new THREE.Vector3(point.x, point.y, point.z);
    objectPosition.add(cameraWorldRight);
    return objectPosition;
}
