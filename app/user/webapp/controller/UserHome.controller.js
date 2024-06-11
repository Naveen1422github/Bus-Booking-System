sap.ui.define(
[
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterType",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/ColumnListItem",
    "sap/m/Input",
    "sap/ui/dom/jquery/getSelectedText",
    "sap/ui/model/type/Date",
    "sap/ui/core/Fragment",
],

function (

    
    Controller,
    JSONModel,
    Filter,
    FilterType,
    FilterOperator,
    MessageBox,
    MessageToast,
    ColumnListItem,
    Input,
    getSelectedText,
    DateType,
    Fragment
    ) {
    "use strict";
    let passengerCount;


    return Controller.extend("app.user.controller.UserHome", {
        onInit: function () {

            var filteredSeatsModel = new JSONModel();
            this.getView().setModel(filteredSeatsModel, "filteredSeats");
       
        // for getting current data matching with datepicker
            var oViewModel = new JSONModel({
                currentDate: new Date(),
            });
            this.getView().setModel(oViewModel, "dateModel");


        // created a model for busDetails 
            var busDetailsModel = new JSONModel({ items: [] });
            this.getView().setModel(busDetailsModel, "busDetails");

            let oModel = this.getOwnerComponent().getModel();

            let oBindList = oModel.bindList("/busDetails");
            oBindList.requestContexts(0, Infinity).then(function (aContexts) {

                var forms = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                var busDetails = forms.map(function (obj) {
                    return obj;
                });

                busDetailsModel.setProperty("/items", busDetails);
            });

    // for seatdetails

            var seatDetailsModel = new JSONModel();
            this.getView().setModel(seatDetailsModel, "seatDetails");

            let oSeatsModel = this.getOwnerComponent().getModel();

            var seatsBindList = oSeatsModel.bindList("/seatDetails")
            seatsBindList.requestContexts(0, Infinity).then(function (aContexts) {

                var forms = aContexts.map(function (oContext) {
                    return oContext.getObject();
                });

                var seatDetails = forms.map(function (obj) {
                    return obj;
                });

                seatDetailsModel.setProperty("/items", seatDetails);
            });

        },

        onSearchBuses: function () {

            var oView = this.getView();
            var Source = oView.byId("sourceInput").getValue();
            var Destination = oView.byId("destinationInput").getValue();

            var busDetailsModel = oView.getModel("busDetails");
            var busDetails = busDetailsModel.getProperty("/items");

            // Filter busDetails based on Source and Destination
            var filteredBuses = busDetails.filter(function (bus) {
                return bus.source.trim().toUpperCase() === Source.trim().toUpperCase() && bus.destination.trim().toUpperCase() === Destination.trim().toUpperCase();
            });

            var inputModel = new JSONModel(filteredBuses);
            this.getView().setModel(inputModel, "inputModel");
        },

        seatsCheck: function (date) {

            date = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            var oView = this.getView();
            var busNumber = oView.byId("busNumber").getValue();
            var totalSeats = oView.getModel("busDetails").getProperty("/items").filter(function(bus){ return busNumber === bus.busNumber})
            totalSeats = totalSeats.map(function(bus){ return bus.totalSeats})



        // Access the seatDetails model
            var oSeatDetailsModel = oView.getModel("seatDetails");
            var seatDetails = oSeatDetailsModel.getProperty("/items");

        // Filter seat details based on busNumber and date
            var filteredSeats = seatDetails.filter(function (seat) {
                return seat.busNumber.trim() === busNumber.trim() && seat.date.trim() === date.trim();
            });

            if (filteredSeats.length > 0) {
                var seatsAvailable = filteredSeats[0].seatsAvailable;
            }
            else {

                seatsAvailable = totalSeats[0]

            }

            // Ensure the fragment is loaded before updating the Input field value
            if (this._pDialog) {
                this._pDialog.then(function (oDialog) {
                    var sDialogId = oView.getId() + "--seatsAvailable";
                    var oInput = sap.ui.getCore().byId(sDialogId);
                    if (oInput) {
                        oInput.setValue(seatsAvailable);
                    }
                });
            } else {
                console.error("Fragment is not loaded.");
            }


        },

        onBookBus: function (oEvent) {
            var oView = this.getView();

            // getting current dates
            var date = oView.getModel("dateModel").getProperty("/currentDate")

            var date = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            var oSource = oEvent.getSource();
            var oContext = oSource.getBindingContext("inputModel");
            var oBusDetails = oContext.getObject();

            var oModel = new JSONModel({ selectedBus: oBusDetails });

            // var oSeatDetails = oSource.getBindingContext("seatDetails").getObject()

            oView.setModel(oModel, "selectedBus");

            var busName = oContext.getProperty("busName");
            var busNumber = oContext.getProperty("busNumber");
			var userName = localStorage.getItem("userName")

            var oBusDetailsModel = new JSONModel({
                busName: busName,
                busNumber: busNumber,
				userName: userName
            });


           // Access the seatDetails model
            var oSeatDetailsModel = oView.getModel("seatDetails");
            var seatDetails = oSeatDetailsModel.getProperty("/items");

        // Filter seat details based on busNumber and date
            var filteredSeats = seatDetails.filter(function (seat) {
                // console.log("bunNumber", seat.busNumber, seat.date)
                return seat.busNumber.trim() === busNumber.trim() && seat.date.trim() === date.trim();
            });

            if (filteredSeats.length > 0) {
                filteredSeats = new JSONModel({seatsAvailable: filteredSeats[0].seatsAvailable});
            }
            else {
                filteredSeats = new JSONModel({seatsAvailable: oContext.getProperty("totalSeats")})
            }


        // json model for filterd seats

            if (!this._pDialog) {
                this._pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "app.user.Fragments.BookingDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            
           
          // binding busDetail and seatsDetails to oDialog
            this._pDialog.then(function (oDialog) {
                oDialog.setModel(oBusDetailsModel, "busDetails");
                oDialog.setModel(filteredSeats, "seatsAvailable")
                oDialog.open();
            });
        },

        onDateChange: function (oEvent) {
            var oDatePicker = oEvent.getSource();
            var oSelectedDate = oDatePicker.getDateValue();
            var oCurrentDate = new Date();
            
            // Set the time of current date to midnight to compare only the date part
            oCurrentDate.setHours(0, 0, 0, 0);

            if (oSelectedDate < oCurrentDate) {
                MessageToast.show("There are no buses available on this date.");
                // Optionally reset the date picker to current date
                var oViewModel = this.getView().getModel("dateModel");
                let date = oCurrentDate
                this.seatsCheck(date)
                oViewModel.setProperty("/currentDate", new Date());
            }
            else {
                let date = oSelectedDate
                this.seatsCheck(date)
            }
        },

        updateSeats:async function(date, busNumber, passengerCount) {
            
            var oView = this.getView()
            var totalSeats = oView.getModel("busDetails").getProperty("/items").filter(function(bus){ return busNumber === bus.busNumber})
            totalSeats = totalSeats.map(function(bus){ return bus.totalSeats})

          // Access the seatDetails model
            var oSeatDetailsModel = oView.getModel("seatDetails");
            var seatDetails = oSeatDetailsModel.getProperty("/items");

          // binding seatdetails model  
            let oModel = this.getView().getModel();
            let oSeatDetailsBindList = oModel.bindList("/seatDetails");

          // Filter seat details based on busNumber and date
            var filteredSeats = seatDetails.filter(function (seat) {
                return seat.busNumber.trim() === busNumber.trim() && seat.date.trim() === date.trim();
            });


            if (filteredSeats.length > 0) {
                var seatsAvailable = filteredSeats[0].seatsAvailable - passengerCount;

                let aFilter = new Filter("ID", sap.ui.model.FilterOperator.EQ,  filteredSeats[0].ID);

                let oBindList = oModel.bindList("/seatDetails", null, null, [aFilter]);

                await oBindList.requestContexts().then(function (aContexts) {
                        console.log("contexttss", aContexts);
                        // Update the properties of the context with new values
                        aContexts[0].setProperty("seatsAvailable", seatsAvailable);
                        
                });

            }
            else {

                seatsAvailable = totalSeats[0] - passengerCount

                
                var seatEntry = {
                    busNumber : busNumber,
                    date : date,
                    seatsAvailable: seatsAvailable 
                }
                oSeatDetailsBindList.create(seatEntry);
            }
  
        },

        onPassengerCountChange: function (oEvent) {
            var oView = this.getView();
            passengerCount = oEvent.getParameter("value");

            var oVBox = oView.byId("passengerDetailsVBox");

            oVBox.removeAllItems();

            for (var i = 0; i < passengerCount; i++) {
                oVBox.addItem(new sap.m.Label({ text: "Passenger " + (i + 1) + " Name" }));
                oVBox.addItem(new sap.m.Input({  }));
                oVBox.addItem(new sap.m.Label({ text: "Passenger " + (i + 1) + " Age" }));
                oVBox.addItem(new sap.m.Input({ type: "Number" }));
                oVBox.addItem(new sap.m.Label({ text: "Passenger " + (i + 1) + " Gender" }));
                oVBox.addItem(new sap.m.ComboBox({
                   items: [
                       new sap.ui.core.Item({ text: "Male" }),
                       new sap.ui.core.Item({ text: "Female" })
                   ]
                }));
            }
        },

        onCancelBooking: function () {
            var oView = this.getView();
            var oVBox = oView.byId("passengerDetailsVBox")
            oVBox.removeAllItems();

            var oVBox = oView.byId("bookingForm");
            
            var oVBoxItems = oVBox.getItems();
            oVBoxItems.forEach(function (item) {
                // Check if the item is an Input control
                if (item instanceof sap.m.Input) {
                    item.setValue(""); // Clear the value
                }

                // Check if the item is a ComboBox control
                if (item instanceof sap.m.ComboBox) {
                    item.setSelectedItem(null); // Clear the selection
                }
            });

            this.byId("bookingDialog").close();
        },

        onConfirmBooking: async function () {

        // Add other booking details
            
            // fetching date from dialog box
            var oView = this.getView(); 
            var travelDate = oView.byId("travelDate").getDateValue();
            // console.log("traveldate", travelDate)
            travelDate = travelDate.toLocaleDateString('en-GB', {
                day: '2-digit', month: 'long', year: 'numeric'
            });

            // generated a booking Id 
            var bookingId = this.getNextID() 

            console.log("bookid", bookingId)
            // fetching details from dialog box
            var mobileNumber = oView.byId("mobileNumber").getValue();
            var email = oView.byId("email").getValue().trim();
            var busNumber = oView.byId("busNumber").getValue();
            var userName = oView.byId("userName").getValue(); 

            // fetching details from passengerDetailsVBox 
            var oVBox = oView.byId("passengerDetailsVBox");
            var oItems = oVBox.getItems(); // passenger entries name, age, gender

            console.log("oitems", oItems)

            //table to save all passenger bookings
            var passengerDetails = []; 

            // checking validations 
            var check = await this.checkValidation(oItems, email, mobileNumber)
            console.log("check", check)
            if (check.length > 0) {
                MessageToast.show(check)
                return ;
            }
            
        // get passenger entries from oItems 
            for (var i = 0; i < oItems.length; i += 6) { // Each passenger has 6 items (3 Labels, 2 Inputs, 1 ComboBox)
                var name = oItems[i + 1].getValue().trim(); // Passenger Name
                var age = parseInt(oItems[i + 3].getValue()); // Passenger Age
                var gender = oItems[i + 5].getSelectedItem().getText(); // Passenger Gender

                // creating entries for a particular passenger for passengerDetails table
                var bookingDetails = {
                    userName: userName,
                    passengerName: name,
                    age: age,
                    gender: gender,
                    busNumber: busNumber,
                    date: travelDate,
                    contactNumber: mobileNumber,
                    email: email,
                    bookingId: bookingId 
                };

                // creating a list of all passenger entries
                passengerDetails.push(bookingDetails);
            }

            // Ensure you are using the correct ODataModel
            let oModel = this.getOwnerComponent().getModel();

            let oBindListPassenger= oModel.bindList("/passengerDetails");
            
            // Perform the create operation for each booking
            passengerDetails.forEach(function(details) {
                oBindListPassenger.create(details);
            });
        
            passengerCount = passengerDetails.length
            // Logic for confirming the booking, such as sending data to the backend
            MessageBox.success("Booking confirmed!");
            this.updateSeats(travelDate, busNumber, passengerCount)
            this.onCancelBooking();
            // location.reload()
        },

        checkValidation: async function (oItems, email, mobileNumber) {

            var msg = "";
            // checking passenger count
            if (oItems.length === 0) {
                msg = "Please add number of Passengers"
                return msg;
            }


            for (var i = 0; i < oItems.length; i += 6) { // Each passenger has 6 items (3 Labels, 2 Inputs, 1 ComboBox)
                // Check if oItems[i + 1] exists and has a getValue method
                if (!oItems[i + 1] || typeof oItems[i + 1].getValue !== 'function') {
                    msg = "Passenger Name is missing";
                    return msg;
                }
                var name = oItems[i + 1].getValue(); // Passenger Name

                // Check if oItems[i + 3] exists and has a getValue method
                if (!oItems[i + 3] || typeof oItems[i + 3].getValue !== 'function') {
                    msg = "Passenger Age is missing";
                    return msg;
                }
                var age = parseInt(oItems[i + 3].getValue(), 10); // Passenger Age

                // Check if oItems[i + 5] exists and has a getSelectedItem method
                if (!oItems[i + 5] || typeof oItems[i + 5].getSelectedItem !== 'function') {
                    msg = "Passenger Gender is missing";
                    return msg;
                }
                var selectedItem = oItems[i + 5].getSelectedItem();
        
                // Check if selectedItem exists and has a getText method
                if (!selectedItem || typeof selectedItem.getText !== 'function') {
                    msg = "Please select a valid gender for the passenger";
                    return msg;
                }
                var gender = selectedItem.getText(); // Passenger Gender

                if (!name.trim()) {
                    msg = "Passenger Name cannot be blank";
                    return msg;
                }

                if (isNaN(age) || age <= 0) {
                    msg = "Please enter a valid age for the passenger";
                    return msg;
                }

                if (!gender.trim()) {
                    msg = "Passenger Gender cannot be blank";
                    return msg;
                }
            }

            //  for (var i = 0; i < oItems.length; i += 6) { // Each passenger has 6 items (3 Labels, 2 Inputs, 1 ComboBox)
            //     var name = oItems[i + 1].getValue(); // Passenger Name
            //     var age = parseInt(oItems[i + 3].getValue()); // Passenger Age
            //     var gender = oItems[i + 5].getSelectedItem().getText(); // Passenger Gender
            // }

        // cheching phone number
            let Number = mobileNumber.replace(/\s/g, ''); // Remove all spaces
            if (Number.length !== 10) {
                msg = "Please Enter your 10 digit mobile number correctly"
                return msg;
            }
            
            // Check if mobile number contains any characters other than digits and spaces
            if (/[^0-9\s]/.test(mobileNumber)) {
                msg = "Mobile number should contain only digits and spaces";
                return msg;
            }

        // mail checking
            if (email.length === 0) {
                msg = "Please Enter your Email";
                return msg;
            }

           return msg; // Return an empty string if no validation error
        },

        getNextID: function () {

            var oView = this.getView();

            var date = oView.getModel("dateModel").getProperty("/currentDate")
            var day = String(date.getDate());
            var hours = String(date.getHours());
            var minutes = String(date.getMinutes());
            var seconds = String(date.getSeconds());
            var year = String(date.getFullYear());
            var month = String(date.getMonth() + 1); // getMonth() returns 0-based index

            // Concatenate all components
            var concatenatedDateStr = day + hours + minutes + seconds + year + month;
            // Convert concatenated string to integer
            var nextId = parseInt(concatenatedDateStr, 10);
            console.log("nxtid", nextId)
            return nextId;
        },


// //  code for bookingss
//         onShowBookings: function () {
//             const router = sap.ui.core.UIComponent.getRouterFor(this);
//             router.navTo("ShowBookings");
// 		}
 
    });
});