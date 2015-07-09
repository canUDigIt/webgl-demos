/*jshint expr: true*/

var bsp = require('../js/bsp.js'),
    expect = require('chai').expect,
    THREE = require('three');

describe('SolidBSP', function() {
    describe('#polygonsFromThreeJsGeometry', function() {
        it('should return a polygon for each face', function() {
            var box = new THREE.BoxGeometry(1, 1, 0);
            var polygons = bsp.polygonsFromThreeJsGeometry(box);
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
            var box = new THREE.BoxGeometry(1, 1, 0);
            var polygons = bsp.polygonsFromThreeJsGeometry(box);
            var rootNode = bsp.createFromPolygons(polygons);
            expect(bsp.allPolygons(rootNode)).to.equal(polygons);
        });

    });

    describe('#planesInside()', function(){
        it('should return a list of polygons inside the BSP', function(){
            expect(false).to.be.ok;
        });
    });
});