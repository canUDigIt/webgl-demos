module.exports = (function(){

    var Vector = {
        negate : function(u) {
            return u.map(function(value) {
                return -value;
            });
        },
        add : function(u, v) {
            return u.map(function(value, index) {
                return value + v[index];
            });
        },
        sub : function(u, v) {
            return this.add(u, this.negate(v));
        },
        dotProduct : function(u, v) {
            return u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
        },  
        crossProduct : function(u, v) {
            // (u2v3 − u3v2, −(u1v3 − u3v1), u1v2 − u2v1)
            return [u[1]*v[2] - u[2]*v[1], -(u[0]*v[2] - u[2]*v[0]), u[0]*v[1] - u[1]*v[0]];
        },
        magnitude : function(u) {
            return Math.sqrt(this.dotProduct(u, u));
        },
        normalize : function(u) {
            var mag = this.magnitude(u);
            return u.map(function(value) {
                return value / mag;
            });
        }
    };

    function Plane(n, d) {
        this.normal = n;
        this.d = d;
    }

    Plane.createPlane = function(a, b, c) {
        var n = Vector.normalize(
            Vector.crossProduct(
                Vector.sub(b, a),
                Vector.sub(c, a)
            )
        ),
        d = Vector.dotProduct(n, a);

        return new Plane(n, d);
    };

    Plane.prototype.distance = function(u) {
        return Vector.dotProduct(this.normal, u) - this.d;
    }

    function Polygon(a, b, c, normal){
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
    }

    function BSPNode(polygons) {
        this.polygons = polygons;
    }

    return {
        Vector : Vector,

        Plane: Plane,

        Polygon : Polygon,

        polygonsFromThreeJsGeometry : function(geometry) {
            return geometry.faces.map(function(face) {
                return new Polygon(
                    geometry.vertices[face.a], 
                    geometry.vertices[face.b], 
                    geometry.vertices[face.c], 
                    face.normal);
            });
        },

        createFromPolygons : function(polygons) {
            return new BSPNode(polygons);
        },

        allPolygons : function(node) {
            return node.polygons;
        },

        classifyPolygon : function(polygon, plane) {
            return 0;
        },
    };
})();