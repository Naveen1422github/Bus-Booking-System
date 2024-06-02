sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("app.user.controller.EditBus", {

        onInit: function () {
            this.getView().setModel(new JSONModel(), "busDetails");
        },

        onFetchBusDetails: function () {
            var oView = this.getView();
            var sBusNumber = oView.byId("busNumberInput").getValue();
            var oModel = this.getOwnerComponent().getModel();

            if (sBusNumber) {
                var sPath = "/busDetails(busNumber='" + sBusNumber + "')";
                var oContext = oModel.bindContext(sPath, null, {
                    $$updateGroupId: "busDetailsGroup"
                });

                oContext.requestObject().then(function (oData) {
                    if (oData) {
                        oView.getModel("busDetails").setData(oData);
                        oView.byId("busDetailsDialog").open();
                    } else {
                        MessageToast.show("Bus not found.");
                    }
                }).catch(function () {
                    MessageToast.show("Bus not found.");
                });
            } else {
                MessageToast.show("Please enter a bus number.");
            }
        },

        onSaveBusDetails: function () {
            var oView = this.getView();
            var oBusDetails = oView.getModel("busDetails").getData();
            var oModel = this.getOwnerComponent().getModel();

            var sPath = "/busDetails(busNumber='" + oBusDetails.busNumber + "')";
            oModel.update(sPath, oBusDetails, {
                groupId: "busDetailsGroup",
                success: function () {
                    MessageToast.show("Bus details updated successfully.");
                    oView.byId("busDetailsDialog").close();
                },
                error: function () {
                    MessageToast.show("Failed to update bus details.");
                }
            });
        },

        onCancel: function () {
            this.getView().byId("busDetailsDialog").close();
        }
    });
});
