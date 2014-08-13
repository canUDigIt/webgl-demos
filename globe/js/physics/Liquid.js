function Liquid(x, y, width, height, drag) {
	this.position = new THREE.Vector3(x, y, 0);
	this.width = width;
	this.height = height;
	this.drag = drag;
}