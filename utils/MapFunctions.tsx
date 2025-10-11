import {LatLng} from "react-native-maps";

const EARTH_RADIUS = 6371000
const DEG_TO_RAD = Math.PI / 180.0
const THREE_PI = Math.PI*3
const TWO_PI = Math.PI*2

function isFloat(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function recursiveConvert(input, callback){
    if (input instanceof Array) {
        return input.map((el) => recursiveConvert(el, callback))
    }
    if  (input instanceof Object) {
        input = JSON.parse(JSON.stringify(input))
        for (let key in input) {
            if( input.hasOwnProperty(key) ) {
                input[key] = recursiveConvert(input[key], callback)
            }
        }
        return input
    }
    if (isFloat(input)) { return callback(input) }
}

function toRadians(input){
    return recursiveConvert(input, (val) => val * DEG_TO_RAD)
}

function toDegrees(input){
    return recursiveConvert(input, (val) => val / DEG_TO_RAD)
}


export function pointAtDistance(inputCoords, distance) {
    const result: LatLng = {latitude: 0, longitude: 0}
    const coords = toRadians(inputCoords)
    const sinLat = 	Math.sin(coords.latitude)
    const cosLat = 	Math.cos(coords.latitude)

    const bearing = Math.random() * TWO_PI
    const theta = distance/EARTH_RADIUS
    const sinBearing = Math.sin(bearing)
    const cosBearing = 	Math.cos(bearing)
    const sinTheta = Math.sin(theta)
    const cosTheta = 	Math.cos(theta)

    result.latitude = Math.asin(sinLat*cosTheta+cosLat*sinTheta*cosBearing);
    result.longitude = coords.longitude +
        Math.atan2( sinBearing*sinTheta*cosLat, cosTheta-sinLat*Math.sin(result.latitude )
        );
    result.longitude = ((result.longitude+THREE_PI)%TWO_PI)-Math.PI

    return toDegrees(result)
}
