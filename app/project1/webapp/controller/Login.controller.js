sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";
    return Controller.extend("project1.controller.Login", {
        onInit: function () {
            // Create global model for user role
            var oGlobalModel = new JSONModel({
                role: ""
            });
            this.getOwnerComponent().setModel(oGlobalModel, "global");
        },
        onLoginPress: function () {
            var oView = this.getView();
            var sUsername = oView.byId("usernameInput").getValue();
            var sPassword = oView.byId("passwordInput").getValue();
            var sRole = oView.byId("roleSelect").getSelectedItem().getKey();
            // Store role in global model
            var oGlobalModel = this.getOwnerComponent().getModel("global");
            oGlobalModel.setProperty("/role", sRole);
            MessageToast.show("Logged in as " + sRole);
            // Route to correct overview based on role
            var oRouter = this.getOwnerComponent().getRouter();
            if (sRole === "admin") {
                oRouter.navTo("Overview", {}, true);
            } else {
                oRouter.navTo("PilotOverview", {}, true);
            }
        }
    });
});
