module.exports = (function(){

    var Vector = {
        negate : function(u) {
            return { x: -u.x, y: -u.y, z: -u.z };
        },
        add : function(u, v) {
            return { x: u.x + v.x, y: u.y + v.y, z: u.z + v.z };
        },
        sub : function(u, v) {
            return this.add(u, this.negate(v));
        },
        dotProduct : function(u, v) {
            return u.x*v.x + u.y*v.y + u.z*v.z;
        },  
        crossProduct : function(u, v) {
            return { x: u.y*v.z - u.z*v.y, y: -(u.x*v.z - u.z*v.x), z: u.x*v.y - u.y*v.x };
        },
        magnitude : function(u) {
            return Math.sqrt(this.dotProduct(u, u));
        },
        normalize : function(u) {
            var mag = this.magnitude(u);
            return {x: u.x/mag, y: u.y/mag, z: u.z/mag};
        }
    };

    function Plane(n, d) {
        this.normal = n;
        this.d = d;
    }

    Plane.createPlaneFromThreePoints = function(a, b, c) {
        var n = Vector.normalize(
            Vector.crossProduct(
                Vector.sub(b, a),
                Vector.sub(c, a)
            )
        ),
        d = Vector.dotProduct(n, a);

        return new Plane(n, d);
    };

    Plane.createPlaneFromPolygon = function(polygon) {
        var d = Vector.dotProduct(polygon.normal, polygon.a);
        return new Plane(polygon.normal, d);
    };

    Plane.prototype.distance = function(u) {
        return Vector.dotProduct(this.normal, u) - this.d;
    };

    function classifyPointToPlane(point, plane, e) {
        var distance = plane.distance(point);

        if (distance > e) {
            return 1;   // in front of plane
        }

        if (distance < -e) {
            return -1;
        }

        return 0;
    }

    function Polygon(a, b, c, normal){
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
    }

    function polygonsFromThreeJsGeometry(geometry) {
        return geometry.faces.map(function(face) {
            return new Polygon(
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
                    var result = splitPolygon(polygon);
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
        Vector : Vector,

        Plane: Plane,

        Polygon : Polygon,

        polygonsFromThreeJsGeometry : polygonsFromThreeJsGeometry,

        createFromPolygons : createFromPolygons,

        classifyPolygon : classifyPolygon,

        isPointInside : isPointInside
    };
})();