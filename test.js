import * as THREE from 'three';

export default quat_last_is_real_test;

function quat_last_is_real_test()
{
    var quat = new THREE.Quaternion();
    quat.identity();
    if(quat.w != 1.0)
    {
        console.log( "Last element is not real!")
    }
    else
    {
        console.log( "Last element is real. All OK")
    }
}