namespace busBooking;

entity busDetails {
    key id            : Integer;
        busName       : String;
    key busNumber     : String;
        source        : String;
        destination   : String;
        departureTime : String;
        arrivalTime   : String;
        price         : Integer;
        totalSheets   : Integer;
}

entity seatDetails {
    key id             : Integer;
    key busNumber      : String;
    key date           : String;
        seatsAvailable : Integer;
}

entity passengerDetails {
    key id            : Integer;
        userName      : String;
        passengerName : String;
        gender        : String;
        age           : Integer;
        busNumber     : String;
        date          : String;
}

entity user {
    key id       : Integer;
    key userName : String;
        password : String;
        isAdmin  : Boolean;
}
