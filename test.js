import * as THREE from 'three';
import {stringToFloatArray, floatArrayToString} from "./transportTools.js"

export function quat_last_is_real_test()
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

export function twos_test()
{
    var array = [12,34,56];
    var str = floatArrayToString(array);
    console.log( str );
    var back = stringToFloatArray( str );
    if( back[0]==12 && back[1]==34 && back[2]==56 )
    {
        console.log( "Test Passed" );
    }
    else
    {
        console.log( "Test Failed" );
    }
    console.log(stringToFloatArray("AAAAQAAAAEAAAABA"))
}
