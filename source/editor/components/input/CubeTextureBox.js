import {Locale} from "../../locale/LocaleManager.js";
import {CubeTexture} from "../../../core/texture/CubeTexture.js";
import {CompressedTexture} from "../../../core/texture/CompressedTexture.js";
import {Image} from "../../../core/resources/Image.js";
import {AddResourceAction} from "../../history/action/resources/AddResourceAction.js";
import {DragBuffer} from "../../gui/DragBuffer.js";
import {Global} from "../../Global.js";
import {Editor} from "../../Editor.js";
import {TableForm} from "../TableForm.js";
import {DropdownList} from "./DropdownList.js";
import {CheckBox} from "./CheckBox.js";
import {Component} from "../Component.js";
import {Texture, CubeReflectionMapping, CubeRefractionMapping, EquirectangularReflectionMapping, EquirectangularRefractionMapping, SphericalReflectionMapping, CubeUVReflectionMapping, CubeUVRefractionMapping} from "three";

function CubeTextureBox(parent)
{
	Component.call(this, parent, "div");

	// Texture preview division
	this.preview = document.createElement("div");
	this.preview.style.cursor = "pointer";
	this.preview.style.position = "absolute";
	this.preview.style.top = "0px";
	this.preview.style.left = "0px";
	this.element.appendChild(this.preview);

	// Alpha background
	this.alpha = document.createElement("img");
	this.alpha.src = Global.FILE_PATH + "alpha.png";
	this.alpha.style.pointerEvents = "none";
	this.alpha.style.position = "absolute";
	this.alpha.style.left = "0px";
	this.alpha.style.top = "0px";
	this.alpha.style.width = "100%";
	this.alpha.style.height = "100%";
	this.preview.appendChild(this.alpha);

	// Image
	this.img = document.createElement("img");
	this.img.style.pointerEvents = "none";
	this.img.style.position = "absolute";
	this.img.style.left = "0px";
	this.img.style.top = "0px";
	this.img.style.width = "100%";
	this.img.style.height = "100%";
	this.preview.appendChild(this.img);

	var self = this;

	// On drop get file dropped
	this.preview.ondrop = function(event)
	{
		// File
		if(event.dataTransfer.files.length > 0)
		{
			var file = event.dataTransfer.files[0];
			var reader = new FileReader();
			reader.onload = function()
			{
				var image = new Image(reader.result);
				var texture = new CubeTexture([image]);
				texture.name = image.name;
				Editor.addAction(new AddResourceAction(texture, Editor.program, "textures"));
				self.setTexture(texture);
			};
			reader.readAsDataURL(file);
		}
		// Resource
		else
		{		
			var uuid = event.dataTransfer.getData("uuid");
			var texture = DragBuffer.get(uuid);

			// Cube texture
			if(texture instanceof Texture && texture.isCubeTexture)
			{
				self.setTexture(texture);
			}
			// Image
			else if(texture instanceof Image)
			{
				var texture = new CubeTexture([texture]);
				texture.name = texture.name;
				Editor.addAction(new AddResourceAction(texture, Editor.program, "textures"));
				self.setTexture(texture);
			}
		}

		event.preventDefault();
	};

	this.form = new TableForm(this);
	this.form.defaultTextWidth = 60;
	this.form.spacing.set(10, 5);

	// Use texture
	this.form.addText(Locale.useTexture);
	this.useTexture = new CheckBox(this.form);
	this.useTexture.size.set(30, 15);
	this.form.add(this.useTexture);
	this.form.nextRow();

	// WrapS
	this.form.addText(Locale.mapping);
	this.mapping = new DropdownList(this);
	this.mapping.size.set(120, 18);
	this.mapping.addValue("Cube Reflection", CubeReflectionMapping);
	this.mapping.addValue("Cube Refraction", CubeRefractionMapping);
	this.mapping.addValue("Equirectangular Reflection", EquirectangularReflectionMapping);
	this.mapping.addValue("Equirectangular Reflection", EquirectangularRefractionMapping);
	this.mapping.addValue("Spherical Reflection", SphericalReflectionMapping);
	this.mapping.addValue("Cube UV Reflection", CubeUVReflectionMapping);
	this.mapping.addValue("Cube UV Reflection", CubeUVRefractionMapping);
	this.form.add(this.mapping);
	this.form.nextRow();

	// onChange function
	this.onChange = null;

	// Texture
	this.texture = null;
}

CubeTextureBox.prototype = Object.create(Component.prototype);

/**
 * Set onchange callback, called after changes.
 *
 * @method setOnChange
 * @param {Function} onChange
 */
CubeTextureBox.prototype.setOnChange = function(onChange)
{
	this.onChange = onChange;
	this.useTexture.setOnChange(onChange);
	this.mapping.setOnChange(onChange);
};

/**
 * Set value stored in the input element.
 *
 * @method setValue
 * @param {Texture} texture
 */
CubeTextureBox.prototype.setValue = function(texture)
{
	if(texture !== null && texture.isCubeTexture)
	{
		this.texture = texture;

		this.useTexture.setValue(true);
		this.mapping.setValue(texture.mapping);

		this.updatePreview();

	}
	else
	{
		this.useTexture.setValue(false);
		this.texture = null;
	}
};

/**
 * Get value stored in the input element.
 *
 * @method setValue
 * @return {Object} Value stored in the input element.
 */
CubeTextureBox.prototype.getValue = function()
{
	if(this.useTexture.getValue())
	{
		if(this.texture !== null)
		{
			this.texture.mapping = this.mapping.getValue();
			this.texture.needsUpdate = true;

			return this.texture;
		}
	}

	return null;
};

// Set Texture
CubeTextureBox.prototype.setTexture = function(texture)
{
	this.setValue(texture);

	if(this.onChange !== null)
	{
		this.onChange();
	}
};

// Update texture preview
CubeTextureBox.prototype.updatePreview = function()
{
	if(this.texture instanceof CubeTexture)
	{
		this.img.src = this.texture.images[0].data;
	}
	else if(this.texture instanceof CompressedTexture)
	{
		// TODO <ADD CODE HERE>
		this.img.src = Global.FILE_PATH + "icon.png";
	}
};

// Update Interface
CubeTextureBox.prototype.updateInterface = function()
{
	if(this.visible)
	{
		this.element.style.visibility = "visible";
	
		// Preview
		this.preview.style.width = this.size.y + "px";
		this.preview.style.height = this.size.y + "px";

		// Form
		this.form.position.set(this.size.y + 5, 0);
		this.form.size.set(this.size.x - this.form.position.x, this.size.y)
		this.form.visible = this.visible;
		this.form.updateInterface();

		// Element
		this.element.style.top = this.position.y + "px";
		this.element.style.left = this.position.x + "px";
		this.element.style.width = this.size.x + "px";
		this.element.style.height = this.size.y + "px";
	}
	else
	{
		this.element.style.visibility = "hidden";
	}

};

export {CubeTextureBox};