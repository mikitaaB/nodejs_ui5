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
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.getRoute("mainPage").attachPatternMatched(this._initPersonalDataModel, this);
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.setModel(Models.createMainPageConfigModel(this.oBundle), "config");
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
		},

		getConfigModel: function() {
			return this.getModel("config");
		},

		_initPersonalDataModel: function() {
			this.showBusy(this.getConfigModel(), "idPersonTable", 10, 0);
			this.sentRequest("GET", "/persons").success(function(aPersonal) {
				this.setModel(new JSONModel(aPersonal), "personalModel");
			}).fail(function(oError) {
				this.showRequestError(oError, "errorProjectPageLoad", this.oBundle);
			}).always(function() {
				this.hideBusy(this.getConfigModel(), "idPersonTable", 10);
			});
		}

	});
});