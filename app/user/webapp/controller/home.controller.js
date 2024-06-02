sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History"
], function (Controller, MessageToast, History) {
    "use strict";

    return Controller.extend("app.user.controller.home", {
        onInit: function () {
            this._attachEnterPressEvent();
        },

        _attachEnterPressEvent: function () {
            var oView = this.getView();
            var oUserNameInput = oView.byId("loginUserName");
            var oPasswordInput = oView.byId("loginPassword");

            var that = this;
            var handleEnterPress = function (oEvent) {
                if (oEvent.which === 13) { // Check if Enter key is pressed
                    that.onSignIn(); // Call the onSignIn function
                }
            };

            oUserNameInput.attachBrowserEvent("keydown", handleEnterPress);
            oPasswordInput.attachBrowserEvent("keydown", handleEnterPress);
        },

        onSignIn: function () {
            var sUserName = this.getView().byId("loginUserName").getValue().toLowerCase();
            var sPassword = this.getView().byId("loginPassword").getValue();

            if (!sUserName || !sPassword) {
                MessageToast.show("Please enter both username and password.");
                return;
            }

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            var sUrl = "/odata/v4/bus-booking/user";

            $.ajax({
                url: sUrl,
                type: "GET",
                data: {
                    $filter: `userName eq '${sUserName}' and password eq '${sPassword}'`
                },
                success: function (oData) {
                    var aUsers = oData.value;
                    if (aUsers.length === 0) {
                        MessageToast.show("Invalid username or password.");
                    } else {
                        var oUser = aUsers[0];
                        // console.log(oUser);
                        if (oUser.password === sPassword) {
                            if (oUser.isAdmin) {
                                oRouter.navTo("RouteAdminHome");
                            } else {
                                oRouter.navTo("RouteUserHome");
                            }
                        } else {
                            MessageToast.show("Invalid username or password.");
                        }
                    }
                },
                error: function () {
                    MessageToast.show("Error in accessing user data.");
                }
            });
        },

        onSignUp: function () {
            const router = sap.ui.core.UIComponent.getRouterFor(this);
            router.navTo("RouteSignUp");
        }
    });
});
