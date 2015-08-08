/**
 * Created by Tracy on 8/5/2015.
 */

module.exports = (function() {
    var CSG = {};
    var Brush = require('./brush.js');

    CSG.union = function(brushA, brushB) {
        var aResults = brushA.classifyBrush(brushB);
        var bResults = brushB.classifyBrush(brushA);

        var outsidePolygons = aResults.outside;
        outsidePolygons = outsidePolygons.concat(bResults.outside);

        return Brush.fromPolygons(outsidePolygons);
    };

    return CSG;
})();