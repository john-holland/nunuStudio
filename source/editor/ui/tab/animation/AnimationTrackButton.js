"use strict";

function AnimationTrackButton(parent, editor, animation, track)
{
	Element.call(this, parent);

	this.element.style.backgroundColor = Editor.theme.barColor;
	this.element.style.overflow = "hidden";

	this.editor = editor;
	this.animation = animation;
	this.track = track;

	var self = this;

	this.element.onmouseenter = function()
	{
		this.style.backgroundColor = Editor.theme.buttonOverColor;
	};

	this.element.onmouseleave = function()
	{
		this.style.backgroundColor = Editor.theme.buttonColor;
	};

	this.element.oncontextmenu = function(event)
	{
		var track = self.track;
		var animation = self.animation;

		var context = new ContextMenu();
		context.size.set(150, 20);
		context.position.set(event.clientX, event.clientY);
		
		context.addOption("Add Keyframe", function()
		{
			self.editor.addKeyFrame(track, self.editor.object);
		});

		context.addOption("Delete", function()
		{
			if(!Editor.confirm("Delete track?"))
			{
				return;
			}

			var index = animation.tracks.indexOf(track);
			if(index !== -1)
			{
				animation.tracks.splice(index, 1);
			}
			else
			{
				alert("Unable to delete track");
			}

			self.editor.createTimeline();
			self.editor.createAnimationMixer();
		});

		context.addOption("Optimize", function()
		{
			track.optimize();

			self.editor.createTimeline();
			self.editor.createAnimationMixer();
		});

		context.addOption("Shift", function()
		{
			var time = Number.parseFloat(prompt("Time to shift track"));

			if(isNaN(time))
			{
				alert("Invalid time value");
				return;
			}

			track.shift(time);

			self.editor.createTimeline();
			self.editor.createAnimationMixer();
		});
		
		context.addOption("Trim", function()
		{
			var start = Number.parseFloat(prompt("Start time"));
			var end = Number.parseFloat(prompt("End time"));

			if(isNaN(start) || isNaN(end))
			{
				alert("Invalid time value");
				return;
			}

			track.trim(start, time);

			self.editor.createTimeline();
			self.editor.createAnimationMixer();
		});

		context.updateInterface();
	};

	this.name = document.createElement("div");
	this.name.style.position = "absolute";
	this.name.style.textOverflow = "ellipsis";
	this.name.style.whiteSpace = "nowrap";
	this.name.style.overflow = "hidden";
	this.name.style.top = "25%";
	this.name.style.width = "100%";
	this.name.style.pointerEvents = "none";
	this.element.appendChild(this.name);

	var keyframe = document.createElement("img");
	keyframe.style.position = "absolute";
	keyframe.style.right = "4px";
	keyframe.style.top = "7px";
	keyframe.style.width = "12px";
	keyframe.style.height = "12px";
	keyframe.style.cursor = "pointer";
	keyframe.src = Editor.filePath + "icons/misc/add.png";
	keyframe.onclick = function()
	{
		self.editor.addKeyFrame(self.track, self.editor.object);
	};
	this.element.appendChild(keyframe);

	this.interpolation = new DropdownList(this.element);
	this.interpolation.size.set(30, 18);
	this.interpolation.position.set(22, 5);
	this.interpolation.updatePosition(Element.TOP_RIGHT);
	this.interpolation.updateSize();
	this.interpolation.addValue("Linear", THREE.InterpolateLinear);
	this.interpolation.addValue("Smooth", THREE.Smooth);
	this.interpolation.addValue("Discrete", THREE.InterpolateDiscrete);
	this.interpolation.setOnChange(function()
	{
		self.track.setInterpolation(self.interpolation.getValue());
		self.editor.createAnimationMixer();
	});

	this.updateTrack();
}

AnimationTrackButton.prototype = Object.create(Element.prototype);

AnimationTrackButton.prototype.updateTrack = function()
{
	this.name.innerHTML = this.track.name;
	this.interpolation.setValue(this.track.getInterpolation());
};

AnimationTrackButton.prototype.updateInterface = function()
{
	this.element.style.left = this.position.x + "px";
	this.element.style.top = this.position.y + "px";
	this.element.style.height = this.size.y + "px";
	this.element.style.width = "100%";
};