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
				"firstName": "",
				"middleName": "",
				"lastName": "",
				"image": {
					"MimeType": "",
        			"OriginalSize": 0
				},
				"post": "",
				"number": "",
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
			this.aValidProps = ["firstName", "middleName", "lastName"];
			this.token = "";
			this._photoTemp = {
				orig: ""
			};
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
				if (oPersonData.image) {
					if (this._photoTemp.orig != "") {
						var photoData = {
							original: this._photoTemp.orig
						};
					}
				}
				this.sentRequest("POST", sPath, oPersonData).success(function() {
					if (this._photoTemp.orig != "") {
						this.sentRequest("POST", "/imageUpload", photoData).success(function() {
							MessageToast.show(this.oBundle.getText("RECORD_ADD_SUCCESS"));
							this.onNavBack();
						}).fail(function(oError) {
							this.showRequestError(oError, "ERROR_PERSON_CREATE", this.oBundle);
						});
					} else {
						MessageToast.show(this.oBundle.getText("RECORD_ADD_SUCCESS"));
						this.onNavBack();
					}
				}).fail(function(oError) {
					this.showRequestError(oError, "ERROR_PERSON_CREATE", this.oBundle);
				}).always(function() {
					this.hideBusy(this.getConfigModel(), "idPersonForm", 10);
				});
			} else {
				var sPath = "/persons/" + oPersonData._id;
				this.showBusy(this.getConfigModel(), "idPersonForm", 10, 0);
				this.sentRequest("PUT", sPath, {
					firstName: oPersonData.firstName,
					middleName: oPersonData.middleName,
					lastName: oPersonData.lastName,
					post: oPersonData.post,
					number: oPersonData.number,
					address: oPersonData.address,
				}).success(function() {
					MessageToast.show(this.oBundle.getText("RECORD_EDIT_SUCCESS"));
					this.onNavBack();
				}).fail(function(oError) {
					this.showRequestError(oError, "ERROR_PERSON_UPDATE", this.oBundle);
				}).always(function() {
					this.hideBusy(this.getConfigModel(), "idPersonForm", 10);
				});
			}
		},

		onTypeMissmatch: function () {
			var sMsg = this._oBundle.getText("GENERAL_IMAGE_UPLOAD_EXTENTION", [this.byId("idFileUploader").getFileType()]);
			MessageToast.show(sMsg);
		},

		onPhotoChange: function(oEvent) {
			var oFile = oEvent.getParameter("files")[0];
			var oPhoto = this.getModel("data").getProperty("/image");
			if (oPhoto === undefined || oPhoto === null) {
				oPhoto = {};
				this.getModel("data").setProperty("/image", oPhoto);
			}
			// var sPath = URL.createObjectURL(oFile);
			// this.byId("idImage").setSrc(sPath);

			oPhoto.MimeType = oFile.type;
			oPhoto.OriginalSize = 0;

			var oReader = new FileReader();
			var that = this;
			oReader.onloadend = function () {
				that.byId("idImage").setSrc(oReader.result);
				that._photoTemp.orig = oReader.result;
				oPhoto.OriginalSize = oReader.result.length;
			};
			if (oFile) {
				oReader.readAsDataURL(oFile);
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