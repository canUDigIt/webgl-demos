module.exports = (function(){
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
        }
    };
})();