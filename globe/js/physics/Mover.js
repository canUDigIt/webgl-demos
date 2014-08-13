function Mover(x, y, z, mass) {
    this.position = new THREE.Vector3(x, y, 0.0);
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
    this.mass = mass;
}

Mover.prototype.applyForce = function(force) {
    this.acceleration.add(force);
};

Mover.prototype.isInside = function(liquid) {
    if (this.position.x > liquid.position.x &&
        this.position.x < liquid.position.x + liquid.width &&
        this.position.y > liquid.position.y &&
        this.position.y < liquid.position.y + liquid.height ) {
        return true;
    }

    return false;
};

Mover.prototype.drag = function(liquid) {
    var speed  = this.velocity.length();
    var dragMagnitude = liquid.drag * speed * speed;

    var dragForce = new THREE.Vector3();
    dragForce.copy(this.velocity);
    dragForce.normalize();
    dragForce.multiplyScalar(-1 * dragMagnitude);

    this.applyForce(dragForce);
};

Mover.prototype.checkEdges = function(width, height) {
    if( this.position.x > width ) {
        this.position.x = width;
        this.velocity.negate();
    }
    else if( this.position.x < 0 ) {
        this.position.x  = 0;
        this.velocity.negate();
    }

    if( this.position.y < 0 ) {
        this.position.y = 0;
        this.velocity.negate();
    }
};

Mover.prototype.update = function(time) {
    this.velocity.add(this.acceleration);

    var velocityLimit = 5;
    this.limitValue(this.velocity, velocityLimit);

    this.position.add(this.velocity);

    this.acceleration.multiplyScalar(0);
};

Mover.prototype.limitValue = function(vector, limit) {
    if (vector.length() > limit){
        vector.setLength(limit);
    }
};