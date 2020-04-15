sap.ui.define([
	"project/app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/ui/core/Fragment",
	"project/app/model/models"
], function (BaseController, JSONModel, MessageBox, MessageToast, Filter, FilterOperator, FilterType, Fragment, Models) {
	"use strict";
	return BaseController.extend("project.app.controller.main", {
		onInit: function () {
			this.model = this.getOwnerComponent().getModel();
			this.oEventBus = sap.ui.getCore().getEventBus();
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.getRoute("mainPage").attachPatternMatched(this._initPersonalDataModel, this);
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.setModel(Models.createMainPageConfigModel(this.oBundle), "config");
			this.token = "";
			this._initPersonalDataModel();
		},

		onTableSearch: function (oEvent) {
			var oComponent = this.byId("idPersonTable");
			var sSearchValue = oEvent.getParameter("newValue");
			var oBinding = oComponent.getBinding("items");
			var aFieldNames = [ "firstName", "middleName", "lastName" ];
			var oFilters = [];
			if (sSearchValue) {
				var aFilters = aFieldNames.map(function (sName) {
					return new Filter(sName, FilterOperator.Contains, sSearchValue);
				});
				oFilters = new Filter({
					"filters": aFilters
				});
			}
			oBinding.filter(oFilters, FilterType.Application);
		},

		showConfirmDialog: function(sMessage) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.confirm(
					sMessage, {
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function(sAction) {
							if (sAction === "OK") {
								resolve();
							} else {
								reject();
							}
						}
					}
				);
			});
		},

		onAdd: function () {
			this.getView().setModel(new JSONModel({}), "PersonModel");
			this._oRouter.navTo("createEditRecords", {Mode: "create"});
			this.oEventBus.publish("person", "token", {token: this.token});
		},

		onEdit: function(oEvent) {
			// var sPath = oEvent.getSource().getBindingContext().getPath();
			// var sId = this.getView().getModel().getProperty(sPath).Id;
			var sPath = oEvent.getSource()._getPropertiesToPropagate().oBindingContexts["personalModel"].getPath();
			var oPerson = this.getModelProperty("personalModel", sPath);
    		this._oRouter.navTo("createEditRecords", {
				Mode: "edit",
				Id: oPerson._id
			});
			this.oEventBus.publish("person", "token", this.token);
		},

		onOpenLoginDialog: function() {
			if (!this.oLoginDialog) {
				var oView = this.getView();
				var that = this;
				Fragment.load({
					"id": oView.getId(),
					"name": "project.app.fragment.loginDialog",
					"controller": that
				}).then(function(oDialog) {
					that.oLoginDialog = oDialog;
					oView.addDependent(that.oLoginDialog);
					that.oLoginDialog.setModel(new JSONModel({
						"username": "",
						"password": ""
					}), "loginModel");
					that.oLoginDialog.open();
				});
			} else {
				this.oLoginDialog.open();
			}
		},

		onOpenSignupDialog: function() {
			if (!this.oSignupDialog) {
				var oView = this.getView();
				var that = this;
				Fragment.load({
					"id": oView.getId(),
					"name": "project.app.fragment.signupDialog",
					"controller": that
				}).then(function(oDialog) {
					that.oSignupDialog = oDialog;
					oView.addDependent(that.oSignupDialog);
					that.oSignupDialog.setModel(new JSONModel({
						"firstname": "",
						"lastname": "",
						"username": "",
						"password": ""
					}), "signupModel");
					that.oSignupDialog.open();
				});
			} else {
				this.oSignupDialog.open();
			}
		},

		onLogin: function() {
			this.showBusy(this.getConfigModel(), "loginDialog", 10, 0);
			var oLoginData = this.oLoginDialog.getModel("loginModel").getData();
			this.sentRequest("POST", "/users/login", {
				username: oLoginData.username,
				password: oLoginData.password
			}).success(function(oPerson) {
				this.token = oPerson.token;
				MessageToast.show(this.oBundle.getText("LOGIN_SUCCESS"));
				this.oLoginDialog.close();
				this.byId("logInButton").setVisible(false);
				this.byId("logOutButton").setVisible(true);
			}).fail(function(oError) {
				this.showRequestError(oError, "ERROR_PERSON_LOGIN", this.oBundle);
			}).always(function() {
				this.hideBusy(this.getConfigModel(), "loginDialog", 10);
			});
		},

		onSignup: function() {
			this.showBusy(this.getConfigModel(), "signupDialog", 10, 0);
			var oSignupData = this.oSignupDialog.getModel("signupModel").getData();
			this.sentRequest("POST", "/users/signup", {
				username: oSignupData.username,
				firstname: oSignupData.firstname,
				lastname: oSignupData.lastname,
				password: oSignupData.password
			}).success(function() {
				MessageToast.show(this.oBundle.getText("SIGNUP_SUCCESS"));
				this.oSignupDialog.close();
			}).fail(function(oError) {
				this.showRequestError(oError, "ERROR_PERSON_CREATE", this.oBundle);
			}).always(function() {
				this.hideBusy(this.getConfigModel(), "signupDialog", 10);
			});
		},

		onLogout: function() {
			this.showBusy(this.getConfigModel(), "mainPage", 10, 0);
			this.sentRequest("GET", "/users/logout", {}).success(function() {
				MessageToast.show(this.oBundle.getText("LOGOUT_SUCCESS"));
				this.byId("logInButton").setVisible(true);
				this.byId("logOutButton").setVisible(false);
			}).fail(function(oError) {
				this.showRequestError(oError, "ERROR_LOGOUT", this.oBundle);
			}).always(function() {
				this.hideBusy(this.getConfigModel(), "mainPage", 10);
			});
		},

		onRemove: function (oEvent) {
			var oBindingContext = oEvent.getSource().getBindingContext("personalModel");
			var oModel = oBindingContext.getModel();
			var sPath = oBindingContext.getPath();
			var oPerson = oModel.getProperty(sPath);
			var iPersonId = oPerson._id;
			this.showBusy(this.getConfigModel(), "idPersonTable", 10, 0);
			var that = this;
			this.showConfirmDialog(this.oBundle.getText("CONFIRM_PERSON_DELETE")).then(function() {
				that.sentRequest("DELETE", "/persons/" + iPersonId, {}).success(function() {
					var oPersonalModel = that.getModel("personalModel");
					var aPersonal = oPersonalModel.getData();
					var iPersonalLength = aPersonal.length;
					for (var i = 0; i < iPersonalLength; i++) {
						if (aPersonal[i]["_id"] === iPersonId) {
							aPersonal.splice(i, 1);
							oPersonalModel.refresh();
						}
					}
					MessageToast.show(this.oBundle.getText("PERSON_DELETE_SUCCESS"));
				}).fail(function(oError) {
					that.showRequestError(oError, "ERROR_PERSON_DELETE", that.oBundle);
				}).always(function() {
					that.hideBusy(that.getConfigModel(), "idPersonTable", 10);
				});
			}, function() {
				that.hideBusy(that.getConfigModel(), "idPersonTable", 10);
			});
		},

		getConfigModel: function() {
			return this.getModel("config");
		},

		onLoginDialogCloseButtonPress: function() {
			this.oLoginDialog.close();
		},

		signupDialogCloseButton: function() {
			this.oSignupDialog.close();
		},

		onLoginDialogAfterClose: function() {
			this.oLoginDialog.setModel(new JSONModel({
				"username": "",
				"password": ""
			}), "loginModel");
		},

		onSignupDialogAfterClose: function() {
			this.oSignupDialog.setModel(new JSONModel({
				"firstname": "",
				"lastname": "",
				"username": "",
				"password": ""
			}), "signupModel");
		},

		_initPersonalDataModel: function() {
			this.showBusy(this.getConfigModel(), "idPersonTable", 10, 0);
			this.sentRequest("GET", "/persons").success(function(aPersonal) {
				this.setModel(new JSONModel(aPersonal), "personalModel");
			}).fail(function(oError) {
				this.showRequestError(oError, "ERROR_MAINPAGE_LOAD", this.oBundle);
			}).always(function() {
				this.hideBusy(this.getConfigModel(), "idPersonTable", 10);
			});
		}

	});
});