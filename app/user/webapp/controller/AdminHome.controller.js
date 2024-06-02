sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History"
], function (Controller, History) {
    "use strict";

    return Controller.extend("app.user.controller.AdminHome", {
        onPressAddBus: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteAddBus"); // Navigate to RouteAddBus defined in manifest.json
        },

        onPressEditBus: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteEditBus"); // Navigate to RouteEditBus defined in manifest.json
        }
    });
});
