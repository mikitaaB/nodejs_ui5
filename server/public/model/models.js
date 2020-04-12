sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createMainPageConfigModel: function() {
			var oModel = new JSONModel({
				"busyIndicator": {
					"idPersonTable": {
						"busy": false,
						"delay": 0,
						"priority": 0
					}
				}
			});
			return oModel;
		},

		createEditPageConfigModel: function() {
			var oModel = new JSONModel({
				"busyIndicator": {
					"idPersonForm": {
						"busy": false,
						"delay": 0,
						"priority": 0
					}
				}
			});
			return oModel;
		}

	};
});