module.exports = (function(){

    var vector = require('./vector.js');
    var Plane = require('./plane.js');

    function Triangle(a, b, c, normal){
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
    }

    function BSPNode(polygon, leaf, solid) {
        this.polygonList = polygon ? [polygon] : [];
        this.plane = polygon ? Plane.createPlaneFromPolygon(polygon) : null;
        this.leaf = leaf;
        this.solid = solid;
        this.front = null;
        this.back = null;
    }

    BSPNode.prototype.isLeaf = function() {
        return this.leaf;
    };

    BSPNode.prototype.isSolid = function() {
        return this.solid;
    };

    BSPNode.prototype.cuttingPlanes = function () {
        var planes = [];
        if (!this.isLeaf()) {
            Array.prototype.push.apply(planes, this.front.cuttingPlanes());
            planes.push(this.plane);
            Array.prototype.push.apply(planes, this.back.cuttingPlanes());
        }

        return planes;
    };

    function uniquePlanes(planes) {
        var unique = [];
        planes.forEach(function (value) {
            if (indexOfObject(unique, value) == -1) {
                unique.push(value);
            }
        });
        return unique;
    }

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
                if (isEquivalent(a[propName], b[propName]) ===   false) {
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

    BSPNode.prototype.classifyBrush = function (otherBrush) {
        var inside = [], outside = [], touchingAligned = [], touchingInverse = [];

        if (!this.isLeaf() && this.plane !== null && this.polygonList.length !== 0) {
            var polygons = otherBrush.allPolygons(),
                planes = this.cuttingPlanes();

            planes = uniquePlanes(planes);
            polygons.forEach(function (polygon) {
                var finalResult = "behind";
                for (var i = 0; i < planes.length; i++) {
                    var cuttingPlane = planes[i],
                        classification = bsp.classifyPolygon(polygon, cuttingPlane);

                    if (classification == "front") {
                        finalResult = "front";
                        break;
                    }
                    else if (classification == "coplanar") {
                        if (isEquivalent(cuttingPlane.normal, polygon.normal)) {
                            finalResult = "aligned";
                        }
                        else
                        {
                            finalResult = "inverse aligned";
                        }

                    }
                    else if (classification == "straddle") {
                        var front = {}, back = {};
                        cuttingPlane.splitPolygon(polygon, front, back);
                        polygon = back;
                        outside.push(front);
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
            }, this);
        }

        return {
            inside: inside,
            outside: outside,
            touchingAligned: touchingAligned,
            touchingInverse: touchingInverse
        };
    };

    BSPNode.prototype.allPolygons = function() {
        var polygons = [];
        if(this.front) {
            Array.prototype.push.apply(polygons, this.front.allPolygons());
        }

        Array.prototype.push.apply(polygons, this.polygonList);

        if(this.back) {
            Array.prototype.push.apply(polygons, this.back.allPolygons());
        }

        return polygons;
    };

    var bsp = {};

    bsp.Triangle = Triangle;

    bsp.polygonsFromThreeJsGeometry = function(geometry) {
        return geometry.faces.map(function(face) {
            return new Triangle(
                geometry.vertices[face.a],
                geometry.vertices[face.b],
                geometry.vertices[face.c],
                face.normal);
        });
    };

    bsp.createFromPolygons = function(polygons) {
        var node = null;
        if (polygons.length === 0) return node;

        if (polygons.length === 1) {
            node = new BSPNode(polygons[0], false, false);
            node.front = new BSPNode(null, true, false);
            node.back = new BSPNode(null, true, true);
            return node;
        }

        var split = selectSplittingPlane(polygons);
        var frontList = [],
            backList = [];

        polygons.forEach(function(polygon) {
            switch(bsp.classifyPolygon(polygon, split.plane))
            {
                case "coplanar":
                case "front":
                    frontList.push(polygon);
                    break;

                case "behind":
                    backList.push(polygon);
                    break;

                case "straddle":
                    var result = split.plane.splitPolygon(polygon);
                    frontList.push(result.front);
                    backList.push(result.back);
                    break;
            }
        });

        node = new BSPNode(split.polygon, false, false);

        if (frontList.length !== 0) {
            node.front = bsp.createFromPolygons(frontList);
        }
        else {
            node.front = new BSPNode(null, true, false);
        }

        if(backList.length !== 0) {
            node.back = bsp.createFromPolygons(backList);
        }
        else {
            node.back = new BSPNode(null, true, true);
        }

        return node;
    };

    function selectSplittingPlane(polygons)
    {
        if (polygons.length === 0) {
            return null;
        }
        var first = polygons.shift();
        return {
            polygon: first,
            plane: Plane.createPlaneFromPolygon(first)
        };
    }

    bsp.classifyPolygon = function(polygon, plane) {
        var numberInFront = 0,
            numberBehind = 0;

        switch( plane.classifyPoint(polygon.a, 0.1) )
        {
            case 1:
                numberInFront++;
                break;

            case -1:
                numberBehind++;
                break;

            default:
        }

        switch( plane.classifyPoint(polygon.b, 0.1) )
        {
            case 1:
                numberInFront++;
                break;

            case -1:
                numberBehind++;
                break;

            default:
        }

        switch( plane.classifyPoint(polygon.c, 0.1) )
        {
            case 1:
                numberInFront++;
                break;

            case -1:
                numberBehind++;
                break;

            default:
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
    };

    bsp.isPointInside = function(point, node) {
        if (node.isLeaf()) {
            return node.isSolid();
        }
        else {
            var classification = node.plane.classifyPoint(point, 0.1);
            if (classification == 1) {
                return bsp.isPointInside(point, node.front);
            }
        }

        return bsp.isPointInside(point, node.back);
    };

    return bsp;
})();