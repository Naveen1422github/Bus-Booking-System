sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, JSONModel, BusyIndicator) {
    "use strict";

    return Controller.extend("app.user.controller.AddBus", {
        onInit: function () {
            // Initialize the view model to handle form data
            var oModel = new JSONModel({
                busName: "",
                busNumber: "",
                source: "",
                destination: "",
                departureTime: "",
                arrivalTime: "",
                price: null,
                totalSeats: null
            });
            this.getView().setModel(oModel, "busModel");
        },

        onAddBus: function () {
            var oModel = this.getView().getModel("busModel");
            var oData = oModel.getData();

            // Validate input fields
            if (!oData.busName || !oData.busNumber || !oData.source || !oData.destination ||
                !oData.departureTime || !oData.arrivalTime || oData.price === null || oData.totalSeats === null) {
                MessageToast.show("Please fill all fields.");
                return;
            }

            // Ensure price and totalSeats are integers
            var price = parseInt(oData.price, 10);
            var totalSeats = parseInt(oData.totalSeats, 10);

            // Check if parseInt returned NaN (in case the fields were not proper numbers)
            if (isNaN(price) || isNaN(totalSeats)) {
                MessageToast.show("Price and Total Seats must be valid numbers.");
                return;
            }

            // Show Busy Indicator
            BusyIndicator.show();

            // First, check if the busNumber already exists
            var that = this;
            $.ajax({
                url: "/odata/v4/bus-booking/busDetails?$filter=busNumber eq '" + encodeURIComponent(oData.busNumber) + "'",
                type: "GET",
                success: function (result) {
                    if (result && result.value && result.value.length > 0) {
                        MessageToast.show("Bus Number already exists. Please use a different Bus Number.");
                        BusyIndicator.hide();
                    } else {
                        // Proceed to add the new bus entry
                        that.addNewBusEntry(oData, price, totalSeats);
                    }
                },
                error: function (xhr) {
                    BusyIndicator.hide();
                    var errorMsg = "Failed to check busNumber existence. Please try again.";
                    if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) {
                        errorMsg = xhr.responseJSON.error.message;
                    }
                    MessageToast.show(errorMsg);
                }
            });
        },

        addNewBusEntry: function (oData, price, totalSeats) {
            var oModel = this.getView().getModel("busModel");

            // Show Busy Indicator
            BusyIndicator.show();

            // First, get the current highest ID
            var that = this;
            $.ajax({
                url: "/odata/v4/bus-booking/busDetails?$orderby=id desc&$top=1",
                type: "GET",
                success: function (result) {
                    var newId = 1;
                    if (result.value && result.value.length > 0) {
                        newId = result.value[0].id + 1;
                    }

                    // Create a new bus detail entry with the new ID
                    var newBusEntry = {
                        id: newId,
                        busName: oData.busName,
                        busNumber: oData.busNumber,
                        source: oData.source,
                        destination: oData.destination,
                        departureTime: oData.departureTime,
                        arrivalTime: oData.arrivalTime,
                        price: price, // Ensure price is sent as an integer
                        totalSeats: totalSeats // Ensure totalSeats is sent as an integer
                    };

                    // Send a POST request to the backend to add the new bus entry
                    $.ajax({
                        url: "/odata/v4/bus-booking/busDetails",
                        type: "POST",
                        contentType: "application/json",
                        data: JSON.stringify(newBusEntry),
                        success: function () {
                            MessageToast.show("Bus added successfully.");
                            // Clear the form
                            oModel.setData({
                                busName: "",
                                busNumber: "",
                                source: "",
                                destination: "",
                                departureTime: "",
                                arrivalTime: "",
                                price: null,
                                totalSeats: null
                            });
                        },
                        error: function (xhr) {
                            var errorMsg = "Failed to add bus. Please try again.";
                            if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) {
                                errorMsg = xhr.responseJSON.error.message;
                            }
                            MessageToast.show(errorMsg);
                        },
                        complete: function () {
                            BusyIndicator.hide();
                        }
                    });
                },
                error: function (xhr) {
                    BusyIndicator.hide();
                    var errorMsg = "Failed to fetch the last ID. Please try again.";
                    if (xhr.responseJSON && xhr.responseJSON.error && xhr.responseJSON.error.message) {
                        errorMsg = xhr.responseJSON.error.message;
                    }
                    MessageToast.show(errorMsg);
                }
            });
        },
    });
});
