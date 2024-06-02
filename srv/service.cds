using { busBooking } from '../db/schema';

service BusBookingService {
    entity busDetails as projection on busBooking.busDetails;
    entity seatDetails as projection on busBooking.seatDetails;
    entity user as projection on busBooking.user;
    entity passengerDetails as projection on busBooking.passengerDetails;
}
