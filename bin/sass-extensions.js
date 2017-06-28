'use-strict';

const sass            = require('node-sass');
const sassUtils       = require('node-sass-utils')(sass);
const _               = require('lodash');

const obj = {
	
	sassListToArray: function(sassList) {
		var jsArray = [];
		var l       = sassList.getLength();

		_.times(l, function(i) {
			var val = sassList.getValue(i);

			switch(sassUtils.typeOf(val)) {
				case 'map':
					jsArray[i] = obj.sassMapToObject(val);
					break;
				case 'list':
					jsArray[i] = obj.sassListToArray(val);
					break;
				case 'color':
					const rgba = [val.getR(), val.getG(), val.getB(), val.getA()];
					jsArray[i] = 'rgba(' + rgba.join(', ') + ')';
					break;
				case 'number':
					jsArray[i] = val.getValue() + val.getUnit();
					break;
				case 'null':
					jsArray[i] = '';
					break;
				default:
					jsArray[i] = val.getValue();
					break;
			}
		});

		return jsArray;
	},

	sassMapToObject: function(sassMap) {
		var jsObject = {};
		var l        = sassMap.getLength();

		_.times(l, function(i) {
			var key = sassMap.getKey(i).getValue();
			if(typeof sassMap.getKey(i).getUnit === 'function') {
				key += sassMap.getKey(i).getUnit();
			}

			var val = sassMap.getValue(i);

			switch(sassUtils.typeOf(val)) {
				case 'map':
					jsObject[key] = obj.sassMapToObject(val);
					break;
				case 'list':
					jsObject[key] = obj.sassListToArray(val);
					break;
				case 'color':
					const rgba    = [val.getR(), val.getG(), val.getB(), val.getA()];
					jsObject[key] = 'rgba(' + rgba.join(', ') + ')';
					break;
				case 'number':
					jsObject[key] = val.getValue() + val.getUnit();
					break;
				case 'null':
					jsObject[key] = '';
					break;
				default:
					jsObject[key] = val.getValue();
					break;
			}
		});

		return jsObject;
	}
}

module.exports = obj;
