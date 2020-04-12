sap.ui.define([
	"sap/ui/core/util/MockServer"
], function (MockServer) {
	"use strict";

	return {
		init: function () {
			var oMockServer = new MockServer({
				rootUri: "/"
			});

			var sPath = "./service";
			var sMetadataUrl = sPath + "/metadata.xml";
			var sJsonFileUrl = sPath + "/mockdata";
			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl : sJsonFileUrl,
				bGenerateMissingMockData : true
			});

			oMockServer.start();
		}
	};

});