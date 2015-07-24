module.exports = (function(){

    var vector = require('./vector.js');

    function Plane(n, d) {
        this.normal = n;
        this.d = d;
    }

    Plane.createPlaneFromThreePoints = function(a, b, c) {
        var n = vector.normalize(
            vector.crossProduct(
                vector.sub(b, a),
                vector.sub(c, a)
            )
        ),
        d = vector.dotProduct(n, a);

        return new Plane(n, d);
    };

    Plane.createPlaneFromPolygon = function(polygon) {
        var d = vector.dotProduct(polygon.normal, polygon.a);
        return new Plane(polygon.normal, d);
    };

    Plane.prototype.distance = function(u) {
        return vector.dotProduct(this.normal, u) - this.d;
    };

    Plane.prototype.splitPolygon = function(polygon, outFrontPolygon, outBackPolygon) {
        var frontVertices = [],
            backVertices = [];

        var getFrontAndBackVerticesFromEdge = function(previous, current, plane) {
            var previousSide = classifyPointToPlane(previous, plane, 0.1),
                currentSide = classifyPointToPlane(current, plane, 0.1),
                intersection;

            var intersectLineSegmentAgainstPlane = function (a, b, plane) {
                var ab = vector.sub(b, a),
                    t = (plane.d - vector.dotProduct(plane.normal, a) ) / vector.dotProduct(plane.normal, ab);

                if(t >= 0.0 && t <= 1.0) {
                    return vector.add(a, vector.multiplyScalar(ab, t));
                }

                return null;
            };

            if( currentSide === 1 ) {
                if ( previousSide === -1 ) {
                    intersection = intersectLineSegmentAgainstPlane(previous, current, plane); // intersect back to front
                    console.assert(classifyPointToPlane(intersection, plane, 0.1) === 0, "Intersection point isn't on plane!!!");
                    frontVertices.push(intersection);
                    backVertices.push(intersection);
                }

                frontVertices.push(current);
            }
            else if( currentSide === -1 ) {
                if( previousSide === 1) {
                    intersection = intersectLineSegmentAgainstPlane(current, previous, plane); // intersect back to front
                    console.assert(classifyPointToPlane(intersection, plane, 0.1) === 0, "Intersection point isn't on plane!!!");
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

        };

        getFrontAndBackVerticesFromEdge(polygon.c, polygon.a, this);
        getFrontAndBackVerticesFromEdge(polygon.a, polygon.b, this);
        getFrontAndBackVerticesFromEdge(polygon.b, polygon.c, this);

        outFrontPolygon.a = frontVertices[0];
        outFrontPolygon.b = frontVertices[1];
        outFrontPolygon.c = frontVertices[2];
        outFrontPolygon.normal = polygon.normal;

        outBackPolygon.a = backVertices[0];
        outBackPolygon.b = backVertices[1];
        outBackPolygon.c = backVertices[2];
        outBackPolygon.normal = polygon.normal;
    };

    function classifyPointToPlane(point, plane, e) {
        var distance = plane.distance(point);

        if (distance > e) {
            return 1;   // in front of plane
        }

        if (distance < -e) {
            return -1;  // behind
        }

        return 0;
    }

    function Triangle(a, b, c, normal){
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
    }

    function polygonsFromThreeJsGeometry(geometry) {
        return geometry.faces.map(function(face) {
            return new Triangle(
                geometry.vertices[face.a],
                geometry.vertices[face.b],
                geometry.vertices[face.c],
                face.normal);
        });
    }

    function selectSplittingPlane(polygons)
    {
        if (polygons.length === 0) {
            return null;
        }
        var first = polygons.shift();
        return Plane.createPlaneFromPolygon(first);
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

    function isPointInside(point, node) {
        if (node.isLeaf()) {
            return node.isSolid();
        }
        else {
            var classification = classifyPointToPlane(point, node.plane, 0.1);
            if (classification == 1) {
                return isPointInside(point, node.front);
            }
        }

        return isPointInside(point, node.back);
    }

    function createFromPolygons(polygons) {
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
            switch(classifyPolygon(polygon, splitPlane))
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
            node.front = createFromPolygons(frontList);
        }
        else {
            node.front = new BSPNode(null, true, false);
        }
        
        if(backList.length !== 0) {
            node.back = createFromPolygons(backList);
        }
        else {
            node.back = new BSPNode(null, true, true);
        }

        return node;
    }

    function classifyPolygon(polygon, plane) {
        var numberInFront = 0,
            numberBehind = 0;

        switch( classifyPointToPlane(polygon.a, plane, 0.1) )
        {
            case 1:
                numberInFront++;
                break;

            case -1:
                numberBehind++;
                break;

            default:
        }

        switch( classifyPointToPlane(polygon.b, plane, 0.1) )
        {
            case 1:
                numberInFront++;
                break;

            case -1:
                numberBehind++;
                break;
                
            default:
        }

        switch( classifyPointToPlane(polygon.c, plane, 0.1) )
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
    }

    return {

        Plane: Plane,

        Triangle : Triangle,

        polygonsFromThreeJsGeometry : polygonsFromThreeJsGeometry,

        createFromPolygons : createFromPolygons,

        classifyPolygon : classifyPolygon,

        isPointInside : isPointInside
    };
})();