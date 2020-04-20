sap.ui.define([
	"project/app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ValueState",
	"sap/m/MessageToast",
	"sap/base/Log",
	"project/app/model/models"
], function (BaseController, JSONModel, UIComponent, ValueState, MessageToast, Log, Models) {
	"use strict";

	return BaseController.extend("project.app.controller.createEditRecords", {
		onInit: function () {
			this.oInitData = {
				"firstname": "",
				"middlename": "",
				"lastname": "",
				"post": "",
				"phone": "",
				"address": ""
			};
			this.model = this.getOwnerComponent().getModel();
			this.oPersonalModel = this.getOwnerComponent().getModel("personalModel");
			this.oEventBus = sap.ui.getCore().getEventBus();
			this.oEventBus.subscribe("person", "token", this.getToken, this);
			this._oRouter = UIComponent.getRouterFor(this);
			this._oRouter.getRoute("createEditRecords").attachPatternMatched(this._onRouteMatched, this);
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.setModel(Models.createEditPageConfigModel(), "config");
			this.aValidProps = ["firstname", "middlename", "lastname"];
			this.token = "";
		},

		getToken: function(sChannel, sEvent, oData) {
			this.token = oData.token;
		},

		onSave: function () {
			var oModel = this.getModel("data");
			var oPersonData = oModel.getData();
			if (!this._checkFields(oModel)) {
				MessageToast.show(this.oBundle.getText("FILL_REQUIRED_FIELD"));
				return;
			}
			if (this.sMode === "create") {
				var sPath = "/persons";
				this.showBusy(this.getConfigModel(), "idPersonForm", 10, 0);
				this.sentRequest("POST", sPath, oPersonData).success(function() {
					MessageToast.show(this.oBundle.getText("RECORD_ADD_SUCCESS"));
					this.onNavBack();
				}).fail(function(oError) {
					this.showRequestError(oError, "ERROR_PERSON_CREATE", this.oBundle);
				}).always(function() {
					this.hideBusy(this.getConfigModel(), "idPersonForm", 10);
				});
			} else {
				var sPath = "/persons/" + oPersonData.id;
				this.showBusy(this.getConfigModel(), "idPersonForm", 10, 0);
				this.sentRequest("PUT", sPath, oPersonData).success(function() {
					MessageToast.show(this.oBundle.getText("RECORD_EDIT_SUCCESS"));
					this.onNavBack();
				}).fail(function(oError) {
					this.showRequestError(oError, "ERROR_PERSON_UPDATE", this.oBundle);
				}).always(function() {
					this.hideBusy(this.getConfigModel(), "idPersonForm", 10);
				});
			}
		},

		onNavBack: function () {
			this.setModel(new JSONModel(this.oInitData), "data");
			this._oRouter.navTo("mainPage");
		},

		getConfigModel: function() {
			return this.getModel("config");
		},

		_checkFields: function (oModel) {
			var bResult = true;
			var iValidPropsLength = this.aValidProps.length;
			for (var i = 0; i < iValidPropsLength; i++) {
				var sProp = oModel.getProperty("/" + this.aValidProps[i]);
				var idControl = "id" + this.aValidProps[i][0].toUpperCase() + this.aValidProps[i].slice(1);
				if (!sProp || sProp === "") {
					this.byId(idControl).setValueState(ValueState.Error);
					bResult = false;
				} else {
					this.byId(idControl).setValueState(ValueState.None);
				}
			}
			return bResult;
		},

		_onRouteMatched: function (oEvent) {
			var oArguments = oEvent.getParameter("arguments");
			this.sMode = oArguments.Mode;
			if (oArguments.Id) {
				var that = this
				this._getPersonData(oArguments.Id, function(oData) {
					that.setModel(oData ? new JSONModel(oData) : new JSONModel({}), "data");
				});
			} else {
				this.setModel(new JSONModel({}), "data");
			}
		},

		_getPersonData: function(sPersonId, fnSuccess) {
			var sPath = "/persons/" + sPersonId;
			this.showBusy(this.getConfigModel(), "idPersonForm", 10, 0);
			this.sentRequest("GET", sPath, {}).success(function(oPerson) {
				fnSuccess(oPerson);
			}).fail(function(oError) {
				this.showRequestError(oError, "ERROR_PERSON_LOAD", this.oBundle);
			}).always(function() {
				this.hideBusy(this.getConfigModel(), "idPersonForm", 10);
			});
		}

	});
});