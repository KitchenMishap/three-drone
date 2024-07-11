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
    var cameraLocalRight = new THREE.Vector3(1, 0, 0);
    cameraLocalRight.multiplyScalar(radius3d);
    var cameraWorldRight = camera.localToWorld(cameraLocalRight);
    cameraWorldRight.sub(camera.position);

    var objectPosition = new THREE.Vector3(point.x, point.y, point.z);
    objectPosition.add(cameraWorldRight);
    return objectPosition;
}

export function sphereToScreenRect(sphere, camera)
{
    var xyr = sphereToScreenCircle(sphere, camera)
    if( xyr.r === Infinity )
    {
        console.log("r is infinity");
    }
    var min = new THREE.Vector2(xyr.x - xyr.r, xyr.y - xyr.r);
    var max = new THREE.Vector2(xyr.x + xyr.r, xyr.y + xyr.r);
    if( max.x === Infinity || max.y === Infinity)
    {
        console.log("Max x or y is inifinity");
    }
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
