module.exports = (function() {

    var vector = require('./vector.js');

    var Plane = function(n, d) {
        this.normal = n;
        this.d = d;
    };

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

    Plane.prototype.classifyPoint = function(point, e) {
        var distance = this.distance(point);

        if (distance > e) {
            return 1;   // in front of plane
        }

        if (distance < -e) {
            return -1;  // behind
        }

        return 0;
    };

    Plane.prototype.splitPolygon = function(polygon, outFrontPolygon, outBackPolygon) {
        var frontVertices = [],
            backVertices = [];

        var getFrontAndBackVerticesFromEdge = function(previous, current, plane) {
            var previousSide = plane.classifyPoint(previous, 0.1),
                currentSide = plane.classifyPoint(current, 0.1),
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
                    console.assert(plane.classifyPoint(intersection, 0.1) === 0, "Intersection point isn't on plane!!!");
                    frontVertices.push(intersection);
                    backVertices.push(intersection);
                }

                frontVertices.push(current);
            }
            else if( currentSide === -1 ) {
                if( previousSide === 1) {
                    intersection = intersectLineSegmentAgainstPlane(current, previous, plane); // intersect back to front
                    console.assert(plane.classifyPoint(intersection, 0.1) === 0, "Intersection point isn't on plane!!!");
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

    return Plane;

})();