"use strict";

THREE.KeyframeTrack.prototype.sort = function()
{
	for(var i = 0; i < this.times.length; i++)
	{
		for(var j = i + 1; j < this.times.length; j++)
		{
			if(this.times[i] > this.times[j])
			{
				var temp = this.times[j];
				this.times[j] = this.times[i];
				this.times[i] = temp;

				var valueSize = this.getValueSize();
				var k = j * valueSize;
				var l = i * valueSize;

				for(var m = 0; m < valueSize; m++)
				{
					var temp = this.values[k + m];
					this.values[k + m] = this.values[l + m];
					this.values[l + m] = temp;
				}
			}
		}
	}
};