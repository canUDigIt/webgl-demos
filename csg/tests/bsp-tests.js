/*jshint expr: true*/

var bsp = require('../js/bsp.js'),
    expect = require('chai').expect,
    THREE = require('three');

describe('Vector', function() {
    describe('#negate', function() {
        it('should return the negative of each vector element', function() {
            var a = [1, 1, 1];
            expect(bsp.Vector.negate(a)).to.eql([-1, -1, -1]);
        });
    });
    describe('#add', function() {
        it('should return the component to compnent sum vector', function(){
            var a = [1, 0, 0];
            var b = [0, 1, 0];
            expect(bsp.Vector.add(a, b)).to.eql([1, 1, 0]);
        });
    });
    describe('#sub', function() {
        it('should return the component to compnent difference vector', function(){
            var a = [2, 5, 0];
            var b = [0, 1, 0];
            expect(bsp.Vector.sub(a, b)).to.eql([2, 4, 0]);
        });
    });
    describe('#dotProduct', function() {
        it('should return the dot product of two vectors', function() {
            var a = [1, 0, 1];
            var b = [1, 2, 3];
            expect(bsp.Vector.dotProduct(a, b)).to.be.equal(4);
        });

        it('should return 0 if vectors are perpendicular', function() {
            var a = [1, 0, 0];
            var b = [0, 1, 0];
            expect(bsp.Vector.dotProduct(a, b)).to.be.equal(0);
        });

        it('should return less than 0 if vectors are obtuse', function() {
            var a = [1, 0, 0];
            var b = [-1, 1, 0];
            expect(bsp.Vector.dotProduct(a, b)).to.be.lessThan(0);
        });

        it('should return greater than 0 if vectors are acute', function() {
            var a = [1, 0, 0];
            var b = [1, 1, 0];
            expect(bsp.Vector.dotProduct(a, b)).to.be.greaterThan(0);
        });
    });

    describe('#crossProduct', function() {
        it('should return the correct direction and magnitude', function() {
            var a = [1, 0, 0];
            var b = [1, 1, 0];

            var sinTheta = Math.sin(Math.PI/4);
            var v = bsp.Vector.crossProduct(a, b);

            // For whatever reason chai thinks that -0 doesn't equal 0 only in
            // an array. If I use expect(0).to.equal(-0) that test passes...
            expect(v).to.eql([0, -0, 1]);
            expect(bsp.Vector.magnitude(v)).to.equal(bsp.Vector.magnitude(a) * bsp.Vector.magnitude(b) * sinTheta);
        });
    });

    describe('#normalize', function() {
        it('should return a vector of length of 1', function() {
            var a = [3, 4, 5];

            expect(Math.abs(bsp.Vector.magnitude(bsp.Vector.normalize(a)))).to.closeTo(1, 0.0001);
        });
    });
});

describe('Plane', function() {
    var plane = null,
        a = undefined,
        b = undefined,
        c = undefined;

    before(function() {
        a = [0, 0, 3];
        b = [1, 0, 3];
        c = [0, 1, 3];

        plane = bsp.Plane.createPlane(a, b, c);
    });

    describe('#createPlane', function(){
        it('should return a plane computed from three noncolinear points', function() {
            expect(plane).to.be.instanceof(bsp.Plane);
            expect(plane.normal).to.eql([0, -0, 1]);
            expect(plane.d).to.equal(3);
        });
    });

    describe('#distance', function() {
        it('should return 0 for all points on plane', function() {
            expect(plane.distance(a)).to.equal(0);
            expect(plane.distance(b)).to.equal(0);
            expect(plane.distance(c)).to.equal(0);
        });

        it('should return a positive value when points are in front of the plane', function() {
            expect(plane.distance([1, 2, 5])).to.be.greaterThan(0);
        });

        it('should return a negative value when points are behind the plane', function() {
            expect(plane.distance([1, 2, -3])).to.be.lessThan(0);
        });
    });
});

describe('SolidBSP', function() {
    var box = null,
        polygons = undefined;

    before(function() {
        box = new THREE.BoxGeometry(1, 1, 0);
        polygons = bsp.polygonsFromThreeJsGeometry(box);
    });

    describe('#polygonsFromThreeJsGeometry', function() {
        it('should return a polygon for each face', function() {
            expect(polygons).to.have.length(box.faces.length);
            polygons.forEach(function(polygon, index) {
                expect(polygon).to.be.instanceof(bsp.Polygon);

                var face = box.faces[index];
                expect(polygon.a).to.be.equal(box.vertices[face.a]);
                expect(polygon.b).to.be.equal(box.vertices[face.b]);
                expect(polygon.c).to.be.equal(box.vertices[face.c]);
                expect(polygon.normal).to.be.equal(face.normal);
            });
        });
    });

    describe('#createFromPolygons()', function(){
        it('should return a BSP tree that contains all the polygons', function() {
            var rootNode = bsp.createFromPolygons(polygons);
            expect(bsp.allPolygons(rootNode)).to.equal(polygons);
        });

    });

    describe('#classifyPolygon()', function(){
        it('should return "front" if in front of the plane', function(){
            var polygon = new bsp.Polygon([-1, 1, 0], [1, 0, 0],  [3, 1, 0], [0, 0, 1]);
            var plane = new bsp.Plane([0, 1, 0], 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("front");
        });

        it('should return "behind" if behind the plane', function(){
            var polygon = new bsp.Polygon([-1, -1, 0], [1, -3, 0],  [3, -1, 0], [0, 0, 1]);
            var plane = new bsp.Plane([0, 1, 0], 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("behind");
        });

        it('should return "straddle" if straddling the plane', function(){
            var polygon = new bsp.Polygon([-1, 1, 0], [1, -1, 0],  [3, 1, 0], [0, 0, 1]);
            var plane = new bsp.Plane([0, 1, 0], 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("straddle");
        });

        it('should return "coplanar" if coplanar to the plane', function() {
            var polygon = new bsp.Polygon([-1, 0, 0], [1, 0, 1],  [3, 0, 0], [0, 0, -1]);
            var plane = new bsp.Plane([0, 1, 0], 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("coplanar");
        });
    });
});