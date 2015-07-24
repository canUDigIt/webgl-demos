module.exports = (function(){

    var vector = {};

    vector.negate = function(u) {
        return { x: -u.x, y: -u.y, z: -u.z };
    };

    vector.multiplyScalar = function(u, scalar) {
        return { x: scalar * u.x, y: scalar * u.y, z: scalar * u.z };
    };

    vector.add = function(u, v) {
        return { x: u.x + v.x, y: u.y + v.y, z: u.z + v.z };
    };

    vector.sub =  function(u, v) {
        return this.add(u, this.negate(v));
    };

    vector.dotProduct = function(u, v) {
        return u.x*v.x + u.y*v.y + u.z*v.z;
    };

    vector.crossProduct = function(u, v) {
        return { x: u.y*v.z - u.z*v.y, y: -(u.x*v.z - u.z*v.x), z: u.x*v.y - u.y*v.x };
    };

    vector.magnitude = function(u) {
        return Math.sqrt(this.dotProduct(u, u));
    };

    vector.normalize = function(u) {
        var mag = this.magnitude(u);
        return {x: u.x/mag, y: u.y/mag, z: u.z/mag};
    };

    return vector;
})();