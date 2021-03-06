import {Locale} from "../../../locale/LocaleManager.js";
import {Editor} from "../../../Editor.js";
import {ContextMenu} from "../../../components/dropdown/ContextMenu.js";
import {DocumentBody} from "../../../components/DocumentBody.js";
import {Component} from "../../../components/Component.js";

/**
 * Animation keyframe is a point the the animation track relative to a specific object.
 *
 * Keyframes can be added moved or deleted in the animation timeline.
 *
 * @class AnimationKeyframe
 * @extends {Component}
 */
function AnimationKeyframe(parent, editor, trackEditor, track, index)
{
	Component.call(this, parent, "div");

	this.element.style.overflow = "visible";
	this.element.style.cursor = "pointer";
	this.element.style.backgroundColor = track.color;

	this.trackEditor = trackEditor;
	this.editor = editor;
	this.track = track;
	this.index = index;

	var self = this;

	this.element.ondblclick = function()
	{
		var time = self.track.times[self.index];
		self.editor.mixer.setTime(time);
	};

	// this.elementframe context menu
	this.element.oncontextmenu = function(event)
	{
		var context = new ContextMenu(DocumentBody);
		context.size.set(150, 20);
		context.position.set(event.clientX, event.clientY);
		
		context.addOption(Locale.delete, function()
		{
			if(!Editor.confirm("Delete keyframe?"))
			{
				return;
			}

			if(self.track.times.length === 1)
			{
				Editor.alert("Track needs to have at least one keyframe!");
				return;
			}
			
			var times = [];
			for(var i = 0; i < self.track.times.length; i++)
			{
				if(i !== self.index)
				{
					times.push(self.track.times[i]);
				}
			}

			var values = [];
			var valueSize = self.track.getValueSize();
			var min = self.index * valueSize;
			var max = min + valueSize - 1;

			for(var i = 0; i < self.track.values.length; i++)
			{
				if(i < min || i > max)
				{
					values.push(self.track.values[i]);
				}
			}

			self.track.times = new Float32Array(times);
			self.track.values = new Float32Array(values);

			self.trackEditor.updateKeyframes();
			self.editor.createAnimationMixer();
		});

		context.addOption(Locale.move, function()
		{
			var time = Number.parseFloat(Editor.prompt("Keyframe time"));

			if(isNaN(time))
			{
				Editor.alert("Invalid time value!");
				return;
			}

			self.track.times[self.index] = time;
			self.track.sort();

			self.trackEditor.updateKeyframes();
			self.editor.createAnimationMixer();
		});

		context.updateInterface();
	};
}

AnimationKeyframe.prototype = Object.create(Component.prototype);

export {AnimationKeyframe};