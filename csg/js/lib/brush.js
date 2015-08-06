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

        var planes = polygons.reduce(function(accumulator, polygon) {
            if(indexOfObject(accumulator, polygon) === -1) {
                accumulator.push(polygon.plane());
            }
            return accumulator;
        }, []);

        return new Brush(polygons, planes);
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

    return Brush;
})();