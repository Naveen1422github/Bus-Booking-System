sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/events/KeyCodes" // Include KeyCodes for key event handling
], function (Controller, MessageToast, History, KeyCodes) {
    "use strict";

    return Controller.extend("app.user.controller.SignUp", {
        onInit: function () {
            this._isAdminSelected = false; // To track if the admin checkbox was selected
        },

        onIsAdminSelect: function (oEvent) {
            this._isAdminSelected = oEvent.getParameter("selected");
            if (this._isAdminSelected) {
                this._getSecretKeyDialog().open();
            }
        },

        onSecretKeySubmit: function () {
            var sSecretKey = this.getView().byId("secretKeyInput").getValue();
            if (sSecretKey === "secret@08") {
                this.getView().byId("signUpIsAdmin").setSelected(true);
                this._getSecretKeyDialog().close();
            } else {
                MessageToast.show("Invalid secret key.");
                this.getView().byId("signUpIsAdmin").setSelected(false);
                this._getSecretKeyDialog().close();
            }
        },

        onSecretKeyCancel: function () {
            this.getView().byId("signUpIsAdmin").setSelected(false);
            this._getSecretKeyDialog().close();
        },

        _getSecretKeyDialog: function () {
            if (!this._oSecretKeyDialog) {
                this._oSecretKeyDialog = this.byId("secretKeyDialog");
            }
            return this._oSecretKeyDialog;
        },

        _validateEmail: function (sEmail) {
            // Check for spaces and validate Gmail format
            var trimmedEmail = sEmail.trim();
            if (trimmedEmail !== sEmail) {
                return false; // If trimming removes spaces, invalid
            }
            return trimmedEmail.toLowerCase().endsWith("@gmail.com");
        },

        _validatePassword: function (sPassword) {
            // Check for spaces, length, and validate password complexity
            if (/\s/.test(sPassword)) {
                return false; // If there are spaces in password, invalid
            }
            if (sPassword.length < 8) {
                return false; // If password is less than 8 characters, invalid
            }
            var hasUpperCase = /[A-Z]/.test(sPassword);
            var hasLowerCase = /[a-z]/.test(sPassword);
            var hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(sPassword);
            var hasDigit = /[0-9]/.test(sPassword);
            return hasUpperCase && hasLowerCase && hasSpecialCharacter && hasDigit;
        },

        // Function to handle sign-up process
        _handleSignUp: function () {
            var sUserName = this.getView().byId("signUpUserName").getValue().trim().toLowerCase();
            var sPassword = this.getView().byId("signUpPassword").getValue().trim();
            var bIsAdmin = this.getView().byId("signUpIsAdmin").getSelected();

            // Check for spaces in username and password
            if (sUserName.indexOf(' ') >= 0 || sPassword.indexOf(' ') >= 0) {
                MessageToast.show("Spaces are not allowed in username or password.");
                return;
            }

            if (!sUserName || !sPassword) {
                MessageToast.show("Please enter both username and password.");
                return;
            }

            if (!this._validateEmail(sUserName)) {
                MessageToast.show("Please enter a valid Gmail address.");
                return;
            }

            if (!this._validatePassword(sPassword)) {
                MessageToast.show("Password must be at least 8 characters long and have at least one uppercase letter, one lowercase letter, a special character, and a digit, without spaces.");
                return;
            }

            var sUrl = "/odata/v4/bus-booking/user";
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            // Check if the user already exists
            $.ajax({
                url: sUrl,
                type: "GET",
                data: {
                    $filter: `userName eq '${sUserName}'`
                },
                success: function (oData) {
                    var aUsers = oData.value;
                    if (aUsers.length > 0) {
                        MessageToast.show("Username already exists.");
                    } else {
                        // Fetch the maximum ID
                        $.ajax({
                            url: sUrl,
                            type: "GET",
                            data: {
                                $orderby: "id desc",
                                $top: 1
                            },
                            success: function (oData) {
                                var maxID = 0;
                                if (oData.value.length > 0) {
                                    maxID = oData.value[0].id;
                                }
                                var newID = maxID + 1;

                                // Create a new user
                                $.ajax({
                                    url: sUrl,
                                    type: "POST",
                                    contentType: "application/json",
                                    data: JSON.stringify({
                                        id: newID, // Use the new ID
                                        userName: sUserName,
                                        password: sPassword,
                                        isAdmin: bIsAdmin
                                    }),
                                    success: function () {
                                        MessageToast.show("User created successfully.");
                                        oRouter.navTo("Routehome");
                                    },
                                    error: function (jqXHR, textStatus, errorThrown) {
                                        console.error("Error in creating user:", textStatus, errorThrown);
                                        console.error("Response:", jqXHR.responseText);
                                        MessageToast.show("Error in creating user.");
                                    }
                                });
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                console.error("Error in fetching max ID:", textStatus, errorThrown);
                                console.error("Response:", jqXHR.responseText);
                                MessageToast.show("Error in fetching max ID.");
                            }
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error in checking existing users:", textStatus, errorThrown);
                    console.error("Response:", jqXHR.responseText);
                    MessageToast.show("Error in checking existing users.");
                }
            });
        },

        // Event handler for key press events in username and password fields
        onKeyPress: function (oEvent) {
            if (oEvent.which === KeyCodes.ENTER) {
                // Check if the event is triggered from username or password field
                var sId = oEvent.getSource().getId();
                if (sId.includes("signUpUserName") || sId.includes("signUpPassword")) {
                    this._handleSignUp();
                }
            }
        },

        // Event handler for sign-up button press
        onSignUp: function () {
            this._handleSignUp();
        }
    });
});
