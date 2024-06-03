using { managed, cuid } from '@sap/cds/common';

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
        totalSeats   : Integer;
}

entity seatDetails: managed, cuid {
    key busNumber      : String;
    key date           : String;
        seatsAvailable : Integer;
}

entity passengerDetails: managed, cuid {
        bookingId     : Integer;
        userName      : String;
        passengerName : String;
        gender        : String;
        age           : Integer;
        busNumber     : String;
        date          : String;
        contactNumber : String;
        email         : String;
}

entity user {
    key id       : Integer;
    key userName : String;
        Name     : String;
        password : String;
        isAdmin  : Boolean;
}
