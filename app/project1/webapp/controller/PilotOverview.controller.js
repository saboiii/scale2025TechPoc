sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";
    return Controller.extend("project1.controller.PilotOverview", {
        onInit: function () {
            // Role-based access control
            var oGlobalModel = this.getOwnerComponent().getModel("global");
            var role = oGlobalModel ? oGlobalModel.getProperty("/role") : "";
            if (role !== "pilot") {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Login", {}, true);
                return;
            }
            // Optionally, set up a model for OCR results
            var oModel = new JSONModel({ ocrResult: "" });
            this.getView().setModel(oModel, "pilot");

            // Attach route matched handler for strict role-based access
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.attachRouteMatched(function (oEvent) {
                if (oEvent.getParameter("name") === "PilotOverview") {
                    var oGlobalModel = this.getOwnerComponent().getModel("global");
                    var role = oGlobalModel ? oGlobalModel.getProperty("/role") : "";
                    if (role !== "pilot") {
                        oRouter.navTo("Login", {}, true);
                    }
                }
            }, this);
        },
        onBeforeRendering: function () {
            // Strict role-based access control on every render
            var oGlobalModel = this.getOwnerComponent().getModel("global");
            var role = oGlobalModel ? oGlobalModel.getProperty("/role") : "";
            if (role !== "pilot") {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("Login", {}, true);
            }
        },
        onSubmitOCR: function () {
            var oView = this.getView();
            var oUploader = oView.byId("pdfUploader");
            if (!oUploader.getValue()) {
                MessageToast.show("Please select a PDF file.");
                return;
            }
            // Simulate OCR API call
            fetch("https://sap-scale-mockapi.vercel.app/api/getOCR", {
                method: "GET"
            })
                .then(function (response) { return response.json(); })
                .then(function (data) {
                    // Log the full response
                    console.log("OCR API Response:", data);
                    if (data && data.hasOwnProperty("status") && data.hasOwnProperty("ocrData")) {
                        var status = data.status;
                        var ocrData = data.ocrData;
                        var sResult = JSON.stringify(ocrData, null, 2);
                        oView.byId("ocrResultText").setText(sResult);
                        if (status === "FAIL") {
                            // Pick a random aircraft and set to out of order
                            var oGlobalModel = this.getOwnerComponent().getModel("global");
                            var aAircraft = oGlobalModel.getProperty("/Aircraft");
                            if (!Array.isArray(aAircraft) || aAircraft.length === 0) {
                                // Try to load from JSON file if not present
                                $.ajax({
                                    url: "model/maintenance-Aircraft.json",
                                    dataType: "json",
                                    async: false,
                                    success: function (result) {
                                        aAircraft = result.Aircraft;
                                        oGlobalModel.setProperty("/Aircraft", aAircraft);
                                        console.log("Aircraft data loaded (AJAX fallback):", aAircraft);
                                        if (Array.isArray(aAircraft) && aAircraft.length > 0) {
                                            var randomIndex = Math.floor(Math.random() * aAircraft.length);
                                            var oAircraft = aAircraft[randomIndex];
                                            oAircraft._outOfOrder = true;
                                            oGlobalModel.setProperty("/Aircraft", aAircraft);
                                            console.log("Aircraft set to out of order:", oAircraft);
                                            MessageToast.show("Flight " + oAircraft.tailNumber + " set to out of order.");
                                        } else {
                                            MessageToast.show("No aircraft data available. Cannot update status.");
                                            console.error("No aircraft data found in global model or JSON.");
                                        }
                                    },
                                    error: function () {
                                        MessageToast.show("Could not load aircraft data.");
                                        console.error("Could not load aircraft data from JSON.");
                                    }
                                });
                            } else if (Array.isArray(aAircraft) && aAircraft.length > 0) {
                                var randomIndex = Math.floor(Math.random() * aAircraft.length);
                                var oAircraft = aAircraft[randomIndex];
                                oAircraft._outOfOrder = true;
                                oGlobalModel.setProperty("/Aircraft", aAircraft);
                                console.log("Aircraft set to out of order:", oAircraft);
                                MessageToast.show("Flight " + oAircraft.tailNumber + " set to out of order.");
                            } else {
                                MessageToast.show("No aircraft data available. Cannot update status.");
                                console.error("No aircraft data found in global model or JSON.");
                            }
                        } else {
                            MessageToast.show("OCR status PASS. No action needed.");
                        }
                    } else {
                        MessageToast.show("OCR API returned unexpected format.");
                        console.error("Unexpected OCR API response format:", data);
                    }
                }.bind(this))
                .catch(function (err) {
                    MessageToast.show("OCR API error.");
                    console.error("OCR API error:", err);
                });
        }
    });
});
