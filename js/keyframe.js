//-------------------------------------------------------
// Key frame object
//-------------------------------------------------------

function KeyFrame() {
	this.frames = new Map();
}

KeyFrame.prototype.copy = function(otherKeyFrame) {
	this.frames = otherKeyFrame.frames;
};

//-------------------------------------------------------
// Key frame system
//-------------------------------------------------------

function KeyFrameSystem() {
	this.currentFrame = new KeyFrame();
	this.currentFrameIndex = 0;

	this.keyframes = [];
}

KeyFrameSystem.prototype.getCurrentKeyFrame = function() {
	return this.currentFrame;
};

KeyFrameSystem.prototype.setCurrentKeyFrame = function(keyFrame) {
	this.currentFrame.copy( keyFrame );
};

KeyFrameSystem.prototype.restoreCurrentKeyFrame = function() {
	this.currentFrame.copy( this.keyframes[this.currentFrameIndex] );
};

KeyFrameSystem.prototype.nextKeyFrame = function() {
	if (this.currentFrameIndex !== (this.keyframes.length - 1)) {
		this.currentFrameIndex++;
		this.currentFrame.copy( this.keyframes[this.currentFrameIndex] );
	}
	else {
		console.log("Can't go to next key frame since you're at the last one.");
	}
};

KeyFrameSystem.prototype.previousKeyFrame = function() {
	if (this.currentFrameIndex !== 0) {
		this.currentFrameIndex--;
		this.currentFrame.copy( this.keyframes[this.currentFrameIndex] );
	}
	else {
		console.log("Can't go to previous key frame since you are at the beginning.");
	}
};

KeyFrameSystem.prototype.deleteCurrentKeyFrame = function() {
	if (this.currentFrameIndex !== 0) {
		this.keyframes.splice(this.currentFrameIndex, 1);
		this.currentFrameIndex--;
		this.currentFrame.copy( this.keyframes[this.currentFrameIndex] );
	}
	else {
		console.log("Can't delete the first key frame.");
	}
};

KeyFrameSystem.prototype.newKeyFrame = function() {
	var newFrame = new KeyFrame();
	newFrame.copy(this.currentFrame);

	this.currentFrameIndex++;
	this.keyframes.splice(this.currentFrameIndex, 0, newFrame);
};
