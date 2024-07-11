import * as THREE from 'three';

export function sphereToScreenCircle(sphere, camera)
{
    var widthHalf = 0.5*window.innerWidth;
    var heightHalf = 0.5*window.innerHeight;

    var vectorRightBehind =  rightOfPointOnScreen(sphere.center, camera, sphere.radius);

    vectorRightBehind.behind.project(camera);
    vectorRightBehind.behind.x = ( vectorRightBehind.behind.x * widthHalf ) + widthHalf;
    vectorRightBehind.behind.y = - ( vectorRightBehind.behind.y * heightHalf ) + heightHalf;

    vectorRightBehind.right.project(camera);
    vectorRightBehind.right.x = ( vectorRightBehind.right.x * widthHalf ) + widthHalf;
    vectorRightBehind.right.y = - ( vectorRightBehind.right.y * heightHalf ) + heightHalf;

    var r= vectorRightBehind.right.x - vectorRightBehind.behind.x;

    return {
        x: vectorRightBehind.behind.x,
        y: vectorRightBehind.behind.y,
        r: r < 0 ? 0 : r
    };
}

export function rightOfPointOnScreen(point, camera, radius3d) {
    var cameraLocalBehind = new THREE.Vector3(0, 0, -1);
    cameraLocalBehind.multiplyScalar(radius3d);
    var cameraWorldBehind = camera.localToWorld(cameraLocalBehind);
    cameraWorldBehind.sub(camera.position);

    var cameraLocalRight = new THREE.Vector3(1, 0, -1);
    cameraLocalRight.multiplyScalar(radius3d);
    var cameraWorldRight = camera.localToWorld(cameraLocalRight);
    cameraWorldRight.sub(camera.position);

    cameraWorldBehind.add(point);
    cameraWorldRight.add(point);
    var result = {};
    result.behind = cameraWorldBehind;
    result.right = cameraWorldRight;
    return result;
}

export function sphereToScreenRect(sphere, camera)
{
    var xyr = sphereToScreenCircle(sphere, camera)
    var min = new THREE.Vector2(xyr.x - xyr.r, xyr.y - xyr.r);
    var max = new THREE.Vector2(xyr.x + xyr.r, xyr.y + xyr.r);
    var sphereBox = new THREE.Box2(min, max);
    var smin = new THREE.Vector2(5,5);
    var smax = new THREE.Vector2(window.innerWidth-5,window.innerHeight-5);
    var scrBox = new THREE.Box2(smin,smax);
    var intBox = sphereBox.intersect(scrBox);
    return intBox;
}

export function sphereToScreenArea(sphere, camera)
{
    var box = sphereToScreenRect(sphere, camera);
    if( box.isEmpty() )
    {
        return 0;
    }
    var area = (box.max.x - box.min.x) * (box.max.y - box.min.y);
    return area;
}
