/**
 * Created by Tracy on 8/4/2015.
 */

var expect = require('chai').expect,
    Brush = require('../js/lib/brush.js'),
    CSG = require('../js/lib/csg.js'),
    THREE = require('three');

function includesPlanes(planesUnderQuestion, planesToInclude) {
    var usedIndices = [],
        found = false;

    for(var i = 0; i < planesToInclude.length; i++) {
        for(var j = 0; j < planesUnderQuestion.length; j++) {
            if(planesUnderQuestion[j].equals(planesToInclude[i]) && usedIndices.indexOf(j) === -1) {
                usedIndices.push(j);
                found = true;
                break;
            }
        }

        if(!found) {
            return false;
        }
    }

    return true;
}

describe('Union', function() {
    it('should join two brushes together', function () {
        var leftBox = new THREE.BoxGeometry(1, 1, 1),
            rightBox = new THREE.BoxGeometry(1, 1, 1),
            leftTranslate = new THREE.Matrix4(),
            rightTranslate = new THREE.Matrix4();

        leftTranslate.makeTranslation(-0.25, 0, 0);
        rightTranslate.makeTranslation(0.25, 0, 0);

        leftBox.applyMatrix(leftTranslate);
        rightBox.applyMatrix(rightTranslate);

        var leftBoxBrush = Brush.fromGeometry(leftBox),
            rightBoxBrush = Brush.fromGeometry(rightBox);

        var expectedBox = new THREE.BoxGeometry(1.5, 1, 1),
            expectedBrush = Brush.fromGeometry(expectedBox);

        var resultingBrush = CSG.union(leftBoxBrush, rightBoxBrush);

        expect(resultingBrush.planes).to.have.length(expectedBrush.planes.length);
        expect(includesPlanes(resultingBrush.planes, expectedBrush.planes)).to.be.true;
    });
});