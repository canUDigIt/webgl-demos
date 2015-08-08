/**
 * Created by Tracy on 8/5/2015.
 */

module.exports = (function() {
    var CSG = {};
    var Brush = require('./brush.js');

    CSG.union = function(brushA, brushB) {
        var aResults = brushA.classifyBrush(brushB);
        var bResults = brushB.classifyBrush(brushA);

        var polygons = aResults.outside;
        polygons = polygons.concat(bResults.outside);
        polygons = polygons.concat(aResults.touchingAligned);
        polygons = polygons.concat(bResults.touchingAligned);
        polygons = polygons.concat(aResults.touchingInverse);
        polygons = polygons.concat(bResults.touchingInverse);

        return Brush.fromPolygons(polygons);
    };

    return CSG;
})();