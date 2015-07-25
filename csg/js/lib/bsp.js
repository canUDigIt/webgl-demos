module.exports = (function(){

    var vector = require('./vector.js');
    var Plane = require('./plane.js');

    function Triangle(a, b, c, normal){
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
    }

    function BSPNode(plane, leaf, solid) {
        this.plane = plane;
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
            node = new BSPNode(Plane.createPlaneFromPolygon(polygons[0]), false, false);
            node.front = new BSPNode(null, true, false);
            node.back = new BSPNode(null, true, true);
            return node;
        }

        var splitPlane = selectSplittingPlane(polygons);
        var frontList = [],
            backList = [];

        polygons.forEach(function(polygon) {
            switch(bsp.classifyPolygon(polygon, splitPlane))
            {
                case "coplanar":
                case "front":
                    frontList.push(polygon);
                    break;

                case "behind":
                    backList.push(polygon);
                    break;

                case "straddle":
                    var result = splitPlane.splitPolygon(polygon);
                    frontList.push(result.front);
                    backList.push(result.back);
                    break;
            }
        });

        node = new BSPNode(splitPlane, false, false);

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

    function selectSplittingPlane(polygons)
    {
        if (polygons.length === 0) {
            return null;
        }
        var first = polygons.shift();
        return Plane.createPlaneFromPolygon(first);
    }

    return bsp;
})();