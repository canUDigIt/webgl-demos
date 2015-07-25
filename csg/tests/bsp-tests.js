/*jshint expr: true*/

var bsp = require('../js/lib/bsp.js'),
    vector = require('../js/lib/vector.js'),
    Plane = require('../js/lib/plane.js'),
    expect = require('chai').expect,
    THREE = require('three');

describe('Vector', function() {
    describe('#negate', function() {
        it('should return the negative of each vector element', function() {
            var a = { x:1, y:1, z:1 };
            expect(vector.negate(a)).to.eql({ x: -1, y: -1, z: -1 });
        });
    });
    describe('#add', function() {
        it('should return the component to compnent sum vector', function(){
            var a = { x:1, y:0, z:0 };
            var b = { x:0, y:1, z:0 };
            expect(vector.add(a, b)).to.eql({ x: 1, y: 1, z: 0 });
        });
    });
    describe('#sub', function() {
        it('should return the component to compnent difference vector', function(){
            var a = { x:2, y:5, z:0 };
            var b = { x:0, y:1, z:0 };
            expect(vector.sub(a, b)).to.eql({ x: 2, y: 4, z: 0 });
        });
    });
    describe('#dotProduct', function() {
        it('should return the dot product of two vectors', function() {
            var a = { x:1, y:0, z:1 };
            var b = { x:1, y:2, z:3 };
            expect(vector.dotProduct(a, b)).to.be.equal(4);
        });

        it('should return 0 if vectors are perpendicular', function() {
            var a = { x:1, y:0, z:0 };
            var b = { x:0, y:1, z:0 };
            expect(vector.dotProduct(a, b)).to.be.equal(0);
        });

        it('should return less than 0 if vectors are obtuse', function() {
            var a = { x:1, y:0, z:0 };
            var b = { x:-1, y:1, z:0 };
            expect(vector.dotProduct(a, b)).to.be.lessThan(0);
        });

        it('should return greater than 0 if vectors are acute', function() {
            var a = { x:1, y:0, z:0 };
            var b = { x:1, y:1, z:0 };
            expect(vector.dotProduct(a, b)).to.be.greaterThan(0);
        });
    });

    describe('#crossProduct', function() {
        it('should return the correct direction and magnitude', function() {
            var a = { x:1, y:0, z:0 };
            var b = { x:1, y:1, z:0 };

            var sinTheta = Math.sin(Math.PI/4);
            var v = vector.crossProduct(a, b);

            // For whatever reason chai thinks that -0 doesn't equal 0 only in
            // an array. If I use expect(0).to.equal(-0) that test passes...
            expect(v).to.eql({ x:0, y:-0, z:1 });
            expect(vector.magnitude(v)).to.equal(vector.magnitude(a) * vector.magnitude(b) * sinTheta);
        });
    });

    describe('#normalize', function() {
        it('should return a vector of length of 1', function() {
            var a = { x:3, y:4, z:5 };

            expect(Math.abs(vector.magnitude(vector.normalize(a)))).to.closeTo(1, 0.0001);
        });
    });
});

describe('Plane', function() {
    var plane = null,
        a,
        b,
        c;

    before(function() {
        a = { x:0, y:0, z:3 };
        b = { x:1, y:0, z:3 };
        c = { x:0, y:1, z:3 };

        plane = Plane.createPlaneFromThreePoints(a, b, c);
    });

    describe('#createPlane', function(){
        it('should return a plane computed from three noncolinear points', function() {
            expect(plane).to.be.instanceof(Plane);
            expect(plane.normal).to.eql({ x:0, y:-0, z:1 });
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
            expect(plane.distance({ x:1, y:2, z:5 })).to.be.greaterThan(0);
        });

        it('should return a negative value when points are behind the plane', function() {
            expect(plane.distance({ x:1, y:2, z:-3 })).to.be.lessThan(0);
        });
    });

    describe('#splitPolygon', function() {
        it('should return two polygons, one in front and one behind, when a polygon straddles the plane', function() {
            var frontPolygon = {},
                backPolygon = {},
                a = { x: 0, y: 2, z: 0 },
                b = { x: 3, y: -1, z: 0 },
                c = { x: 6, y: 2, z: 0 },
                intersection = { x: 3, y: 2, z: 0 },
                plane = new Plane({ x: 1, y: 0, z: 0 }, 3),
                polygon = new bsp.Triangle(a, b, c, { x: 0, y: 0, z: 1 });

            plane.splitPolygon(polygon, frontPolygon, backPolygon);

            expect(backPolygon).to.eql({
                a: intersection,
                b: a,
                c: b,
                normal: { x: 0, y: 0, z: 1 }
            });

            expect(frontPolygon).to.eql({
                a: intersection,
                b: b,
                c: c,
                normal: { x: 0, y: 0, z: 1 }
            });
        });
    });
});

describe('SolidBSP', function() {
    var box = null,
        polygons;

    before(function() {
        box = new THREE.BoxGeometry(1, 1, 1);
        polygons = bsp.polygonsFromThreeJsGeometry(box);
    });

    describe('#polygonsFromThreeJsGeometry', function() {
        it('should return a polygon for each face', function() {
            expect(polygons).to.have.length(box.faces.length);
            polygons.forEach(function(polygon, index) {
                expect(polygon).to.be.instanceof(bsp.Triangle);

                var face = box.faces[index];
                expect(polygon.a).to.be.equal(box.vertices[face.a]);
                expect(polygon.b).to.be.equal(box.vertices[face.b]);
                expect(polygon.c).to.be.equal(box.vertices[face.c]);
                expect(polygon.normal).to.be.equal(face.normal);
            });
        });
    });

    describe('#classifyPolygon()', function() {
        it('should return "front" if in front of the plane', function(){
            var polygon = new bsp.Triangle({ x:-1, y:1, z:0 }, { x:1, y:0, z:0 },  { x:3, y:1, z:0 }, { x:0, y:0, z:1 });
            var plane = new Plane({ x:0, y:1, z:0 }, 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("front");
        });

        it('should return "behind" if behind the plane', function(){
            var polygon = new bsp.Triangle({ x:-1, y:-1, z:0 }, { x:1, y:-3, z:0 },  { x:3, y:-1, z:0 }, { x:0, y:0, z:1 });
            var plane = new Plane({ x:0, y:1, z:0 }, 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("behind");
        });

        it('should return "straddle" if straddling the plane', function(){
            var polygon = new bsp.Triangle({ x:-1, y:1, z:0 }, { x:1, y:-1, z:0 },  { x:3, y:1, z:0 }, { x:0, y:0, z:1 });
            var plane = new Plane({ x:0, y:1, z:0 }, 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("straddle");
        });

        it('should return "coplanar" if coplanar to the plane', function() {
            var polygon = new bsp.Triangle({ x:-1, y:0, z:0 }, { x:1, y:0, z:1 },  { x:3, y:0, z:0 }, { x:0, y:0, z:-1 });
            var plane = new Plane({ x:0, y:1, z:0 }, 0);
            expect(bsp.classifyPolygon(polygon, plane)).to.equal("coplanar");
        });
    });

    describe('#isPointInside()', function() {
        it('should return true if a point is inside solid space', function() {
            var rootNode = bsp.createFromPolygons(polygons);
            var point = { x:0, y:0, z:0 };
            expect(bsp.isPointInside(point, rootNode)).to.be.true;
        });

        it('should return false when a point is outside of solid space', function() {
            var rootNode = bsp.createFromPolygons(polygons);
            var point = { x:2, y:2, z:2 };
            expect(bsp.isPointInside(point, rootNode)).to.be.false;
        });
    });
});