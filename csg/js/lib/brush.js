/**
 * Created by Tracy on 8/4/2015.
 */

module.exports = (function(){
    var THREE = require('three');

    var Brush = function(polygons, planes) {
        this.polygons = polygons;
        this.planes = planes;
    };

    Brush.fromGeometry = function(geometry) {
        var polygons = geometry.faces.map(function(face) {
            return new THREE.Triangle(
                geometry.vertices[face.a],
                geometry.vertices[face.b],
                geometry.vertices[face.c]);
        });

        return Brush.fromPolygons(polygons);
    };

    Brush.fromPolygons = function(polygons) {
        var planes = polygons.reduce(function(accumulator, polygon) {
            if(indexOfObject(accumulator, polygon) === -1) {
                accumulator.push(polygon.plane());
            }
            return accumulator;
        }, []);

        return new Brush(polygons, planes);
    };

    Brush.prototype.classifyBrush = function (otherBrush) {
        var inside = [], outside = [], touchingAligned = [], touchingInverse = [];

        for (var i = 0; i < otherBrush.polygons.length; i++) {
            var polygon = otherBrush.polygons[i],
                finalResult = "behind";

            for (var j = 0; j < this.planes.length; j++) {
                var cuttingPlane = this.planes[j],
                    classification = classifyPolygon(polygon, cuttingPlane);

                if (classification == "front") {
                    finalResult = "front";
                    break;
                }
                else if (classification == "coplanar") {
                    if (cuttingPlane.normal.equals(polygon.normal())) {
                        finalResult = "aligned";
                    }
                    else
                    {
                        finalResult = "inverse aligned";
                    }

                }
                else if (classification == "straddle") {
                    var results = splitPolygon(polygon, cuttingPlane);
                    polygon = results.back;
                    outside.push(results.front);
                }
            }

            if (finalResult == "aligned") {
                touchingAligned.push(polygon);
            }

            if (finalResult == "inverse aligned") {
                touchingInverse.push(polygon);
            }

            if (finalResult == "behind") {
                inside.push(polygon);
            }

            if (finalResult == "front") {
                outside.push(polygon);
            }
        }

        return {
            inside: inside,
            outside: outside,
            touchingAligned: touchingAligned,
            touchingInverse: touchingInverse
        };
    };

    function indexOfObject(array, value) {
        var index = -1;

        for (var i = 0; i < array.length; i++) {
            if (isEquivalent(array[i], value)) {
                index = i;
                break;
            }
        }

        return index;
    }

    function isEquivalent(a, b) {
        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(a);
        var bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // If values of same property are not equal,
            // objects are not equivalent
            if (typeof a[propName] === "object") {
                if (isEquivalent(a[propName], b[propName]) === false) {
                    return false;
                }
            }
            else {
                if (a[propName] !== b[propName]) {
                    return false;
                }
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

    function classifyPolygon(polygon, plane) {
        var numberInFront = 0,
            numberBehind = 0,
            classification = [];

        classification.push(classifyPoint(polygon.a, plane));
        classification.push(classifyPoint(polygon.b, plane));
        classification.push(classifyPoint(polygon.c, plane));

        for(var i = 0; i < classification.length; i++)
        {
            if (classification[i] === -1 ) {
                numberBehind++;
            }
            else if (classification[i] === 1) {
                numberInFront++;
            }
            else {
                // coplanar
            }
        }

        if (numberInFront !== 0 && numberBehind !== 0) {
            return "straddle";
        }

        if (numberInFront !== 0) {
            return "front";
        }

        if (numberBehind !== 0) {
            return "behind";
        }

        return "coplanar";
    }

    function classifyPoint(point, plane) {
        var distance = plane.distanceToPoint(point),
            tolerance = 0.1;
        if (distance < -tolerance) {
            return -1;
        }
        else if (distance > tolerance) {
            return 1;
        }
        else {
            // coplanar
        }

        return 0;
    }

    function splitPolygon(polygon, plane) {
        var frontVertices = [],
            backVertices = [];

        getFrontAndBackVerticesFromEdge(polygon.c, polygon.a, plane, frontVertices, backVertices);
        getFrontAndBackVerticesFromEdge(polygon.a, polygon.b, plane, frontVertices, backVertices);
        getFrontAndBackVerticesFromEdge(polygon.b, polygon.c, plane, frontVertices, backVertices);

        var front = new THREE.Triangle(frontVertices[0], frontVertices[1], frontVertices[2]),
            back = new THREE.Triangle(backVertices[0], backVertices[1], backVertices[2]);

        return {
            front: front,
            back: back
        }
    }

    function getFrontAndBackVerticesFromEdge(previous, current, plane, frontVertices, backVertices) {
        var previousSide = classifyPoint(previous, plane),
            currentSide = classifyPoint(current, plane),
            intersection;

        if( currentSide === 1 ) {
            if ( previousSide === -1 ) {
                intersection = plane.intersectLine(new THREE.Line3(previous, current)); // intersect back to front
                console.assert(classifyPoint(intersection, plane) === 0, "Intersection point isn't on plane!!!");
                frontVertices.push(intersection);
                backVertices.push(intersection);
            }

            frontVertices.push(current);
        }
        else if( currentSide === -1 ) {
            if( previousSide === 1) {
                intersection = plane.intersectLine(new THREE.Line3(current, previous)); // intersect back to front
                console.assert(classifyPoint(intersection, plane) === 0, "Intersection point isn't on plane!!!");
                frontVertices.push(intersection);
                backVertices.push(intersection);
            }
            else if( previousSide === 0 ) {
                backVertices.push(previous);
            }

            backVertices.push(current);
        }
        else {
            frontVertices.push(current);

            if( previousSide === -1 ) {
                backVertices.push(current);
            }
        }

    }

    return Brush;
})();