import * as THREE from 'three';

export function toScreenCircle(obj, camera, radius3d)
{
    var vector = new THREE.Vector3();

    var widthHalf = 0.5*window.innerWidth;
    var heightHalf = 0.5*window.innerHeight;

    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);

    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;

    var vectorRight =  rightOfObjectOnScreen(obj, camera, radius3d);
    vectorRight.project(camera);

    vectorRight.x = ( vectorRight.x * widthHalf ) + widthHalf;
    vectorRight.y = - ( vectorRight.y * heightHalf ) + heightHalf;

    var r= vectorRight.x - vector.x

    return {
        x: vector.x,
        y: vector.y,
        r: r < 0 ? 0 : r
    };
}

export function rightOfObjectOnScreen(obj, camera, radius3d) {
    var cameraLocalRight = new THREE.Vector3(1, 0, 0);
    cameraLocalRight.multiplyScalar(radius3d);
    var cameraWorldRight = camera.localToWorld(cameraLocalRight);
    cameraWorldRight.sub(camera.position);

    var objectPosition = new THREE.Vector3(obj.position.x, obj.position.y, obj.position.z);
    objectPosition.add(cameraWorldRight);
    return objectPosition;
}
