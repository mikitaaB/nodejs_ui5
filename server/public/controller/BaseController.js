sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/base/Log"
], function(Controller, MessageBox, Log) {
	"use strict";
	return Controller.extend("project.app.controller.BaseController", {

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Get property of model
		 * @public
		 * @param {string} sModel the model name
		 * @param {string} sProperty the property name
		 * @returns {any} the value for the property with the given sProperty
		 */
		getModelProperty: function(sModel, sProperty) {
			return this.getView().getModel(sModel).getProperty(sProperty);
		},

		/**
		 * Set property of model
		 * @public
		 * @param {string} sModel the model name
		 * @param {string} sProperty the property name
		 * @param {any} oData seting data
		 */
		setModelProperty: function(sModel, sProperty, oData) {
			this.getView().getModel(sModel).setProperty(sProperty, oData);
		},

		/**
		 * Method for sending requests to the server.
		 *
		 * @public
		 * @param {string} sMethod the request method
		 * @param {string} sUrl the request url
		 * @param {any} oData the data to sending
		 * @param {function} fnSuccess the succeess function
		 * @param {function} fnError the error function
		 * @returns the promice
		 */
		sentRequest: function(sMethod, sUrl, oData, fnSuccess, fnError) {
			var promise = jQuery.ajax({
				"url": sUrl,
				"method": sMethod,
				"data": sMethod.toUpperCase().indexOf("GET") === 0 ? oData : JSON.stringify(oData),
				"contentType": "application/json;charset=UTF-8",
				"context": this
			});
			if (fnSuccess) {
				promise.done(fnSuccess);
			}
			if (fnError) {
				promise.fail(fnError);
			}
			return promise;
        },

        /**
		 * Method for add busy property to config model.
		 * @function
		 * @public
		 * @param {sap.ui.model.json.JSONModel} oConfig - config model
		 * @param {string} sName - a property name
		 * @param {number} iPriority - a number priority
		 * @param {number} iDelay -a number delay
		 */
		showBusy: function(oConfig, sName, iPriority, iDelay) {
			var oConfigData = oConfig.getData();
			var oBusyIndicator = oConfigData.busyIndicator;
			if (oBusyIndicator && oBusyIndicator[sName]) {
				oBusyIndicator[sName].busy = true;
				oBusyIndicator[sName].priority = iPriority || 0;
				if (iDelay) {
					oBusyIndicator[sName].delay = iDelay;
				}
				oConfig.refresh();
			} else {
				Log.warning(this.oBundle.getText("LOG_BUSY_ON_UNDEFINED_CONTROL"));
			}
		},

		/**
		 * Method for remove busy property to config model.
		 * @function
		 * @public
		 * @param {sap.ui.model.json.JSONModel} oConfig - config model
		 * @param {string} sName - a property name
		 * @param {number} iPriority - a number priority
		 */
		hideBusy: function(oConfig, sName, iPriority) {
			var oConfigData = oConfig.getData();
			var oBusyIndicator = oConfigData.busyIndicator;
			if (oBusyIndicator && oBusyIndicator[sName] && oBusyIndicator[sName].priority <= iPriority) {
				oConfigData.busyIndicator[sName].busy = false;
				oConfigData.busyIndicator[sName].priority = 0;
				oConfig.refresh();
			} else {
				Log.warning(this.oBundle.getText("LOG_BUSY_ON_UNDEFINED_CONTROL"));
			}
        },

        /**
		 * Method to show request error.
		 *
		 * @function
		 * @public
		 * @param {backendError} oError - Error object that comes from backend
		 * @param {string} sMessage - String which represents error
		 * @param {object} oBundle - Resource bundle to get access the i18n model to get the text
		 */
		showRequestError: function(oError, sMessage, oBundle) {
			if (oError.responseJSON && oError.responseJSON.message) {
				Log.error(oError && oError.responseJSON.message);
				MessageBox.error(oBundle.getText(oError.responseJSON.message));
			} else {
				Log.error(oError && oError.message);
				MessageBox.error(oBundle.getText(sMessage));
			}
		},

	});
});