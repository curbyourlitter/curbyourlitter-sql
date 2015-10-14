"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.makeBBox = makeBBox;
exports.inBBox = inBBox;
exports.fromCenterOfBBox = fromCenterOfBBox;

function makeBBox(coords) {
    return "ST_SetSRID(ST_MakeBox2D(ST_Point(" + coords[0] + ", " + coords[1] + "), ST_Point(" + coords[2] + ", " + coords[3] + ")), 4326)";
}

function inBBox(coords) {
    return "the_geom && " + makeBBox(coords);
}

function fromCenterOfBBox(coords) {
    return "ST_Distance(the_geom, ST_Centroid(" + makeBBox(coords) + "))";
}