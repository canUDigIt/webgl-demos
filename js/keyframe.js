//-------------------------------------------------------
// Key frame object
//-------------------------------------------------------

function KeyFrame() {
	this.frames = new Map();
}

KeyFrame.prototype.copy = function(otherKeyFrame) {
	if (otherKeyFrame instanceof KeyFrame) {
		otherKeyFrame.frames.each( function(key, value) {
			this.frames.put(key, value);
		}, this );
	}

	return this;
};

//-------------------------------------------------------
// Key frame system
//-------------------------------------------------------

function KeyFrameSystem(initialKeyFrame) {
	this.currentFrameIndex = 0;

	this.keyframes = [new KeyFrame().copy(initialKeyFrame)];
}

KeyFrameSystem.prototype.getCurrentKeyFrame = function() {
	return this.keyframes[this.currentFrameIndex];
};

KeyFrameSystem.prototype.setCurrentKeyFrame = function(currentFrame) {
	this.keyframes[this.currentFrameIndex].copy(currentFrame);
};

KeyFrameSystem.prototype.nextKeyFrame = function() {
	if (this.currentFrameIndex !== (this.keyframes.length - 1)) {
		this.currentFrameIndex++;
	}
	else {
		console.log("Can't go to next key frame since you're at the last one.");
	}
};

KeyFrameSystem.prototype.previousKeyFrame = function() {
	if (this.currentFrameIndex !== 0) {
		this.currentFrameIndex--;
	}
	else {
		console.log("Can't go to previous key frame since you are at the beginning.");
	}
};

KeyFrameSystem.prototype.deleteCurrentKeyFrame = function() {
	if (this.currentFrameIndex !== 0) {
		this.keyframes.splice(this.currentFrameIndex, 1);
		this.currentFrameIndex--;
	}
	else {
		console.log("Can't delete the first key frame.");
	}
};

KeyFrameSystem.prototype.newKeyFrame = function(currentFrame) {
	var newFrame = new KeyFrame();
	newFrame.copy(currentFrame);

	this.currentFrameIndex++;
	this.keyframes.splice(this.currentFrameIndex, 0, newFrame);
};
