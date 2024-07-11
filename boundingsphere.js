import * as THREE from 'three';
import {stableSort} from './stablesort.js'
import {sphereToScreenArea} from './threeto2d.js'

export function sortedByScreenArea(camera, hiresLoresSphere, sortedByArea)
{
    // Stuff from bounding spheres
    for( var i=0; i<hiresLoresSphere.length; i++)
    {
        var index = sortedByArea[i].index;

        var bs = hiresLoresSphere[index].hires.boundingSphere;

        // Want to rotate by x axis 180 degrees. This is a trial and error hack
        var bs2 = new THREE.Sphere;
        bs2.center.x = bs.center.x;
        bs2.center.y = bs.center.z;
        bs2.center.z = -bs.center.y;
        bs2.radius = bs.radius;

        sortedByArea[i].screenArea = sphereToScreenArea(bs2, camera );
    }

    // Sort by radius
    return stableSort(sortedByArea, (a,b)=>a.screenArea - b.screenArea);
}