export function stringToFloatArray(str)
{
    let blob = atob( str );
    let ary_buf = new ArrayBuffer( blob.length );
    let dv = new DataView( ary_buf );
    for( let i=0; i < blob.length; i++ ) dv.setUint8( i, blob.charCodeAt(i) );
    let f32_ary = new Float32Array( ary_buf );
    return Array.from(f32_ary);
}

export function floatArrayToString(arr)
{
    let fary = new Float32Array(arr);
    let uint = new Uint8Array( fary.buffer );
    let str = btoa( String.fromCharCode.apply( null, uint ) );
    return str;
}
