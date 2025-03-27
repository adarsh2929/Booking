import { NextFunction, Request, Response } from "express";
import { DefaultResponse } from "../helper/defaultResponse";
import { CustomError } from "../helper/customError";
import { bookingRepo } from "../repository/bookingRepo";
import { BookingType, BookingSlot } from "@prisma/client";
import { authRepo } from "../repository/authRepo";

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      userId, 
      customerName, 
      customerEmail, 
      bookingDate, 
      bookingType, 
      bookingSlot, 
      startTime, 
      endTime 
    } = req.body;

    // Validate user exists
    const user = await authRepo.getUserById(userId);
    if (!user) {
      throw new CustomError(404, "User not found");
    }

    // Parse booking date
    const parsedBookingDate = new Date(bookingDate);

    // Validate booking constraints based on type
    if (bookingType === BookingType.FULLDAY) {
      // Check if any bookings exist for that date
      const existingBookings = await bookingRepo.getBookingsByDate(parsedBookingDate);
      if (existingBookings.length > 0) {
        throw new CustomError(409, "The selected date already has bookings");
      }
    } else if (bookingType === BookingType.HALFDAY) {
      if (!bookingSlot) {
        throw new CustomError(400, "Booking slot is required for half-day bookings");
      }

      // Check if full day booking exists
      const hasFullDay = await bookingRepo.hasFullDayBooking(parsedBookingDate);
      if (hasFullDay) {
        throw new CustomError(409, "The selected date already has a full-day booking");
      }

      // Check if the same half-day slot is already booked
      const hasHalfDay = await bookingRepo.hasHalfDayBooking(parsedBookingDate, bookingSlot);
      if (hasHalfDay) {
        throw new CustomError(409, "The selected half-day slot is already booked");
      }

      // For half-day bookings, check overlapping custom bookings
      const halfDayStart = new Date(parsedBookingDate);
      const halfDayEnd = new Date(parsedBookingDate);
      
      if (bookingSlot === BookingSlot.FIRSTHALF) {
        halfDayStart.setHours(8, 0, 0, 0);
        halfDayEnd.setHours(12, 0, 0, 0);
      } else { // SECONDHALF
        halfDayStart.setHours(13, 0, 0, 0);
        halfDayEnd.setHours(17, 0, 0, 0);
      }

      const hasOverlap = await bookingRepo.hasOverlappingCustomBooking(
        parsedBookingDate, 
        halfDayStart, 
        halfDayEnd
      );
      
      if (hasOverlap) {
        throw new CustomError(409, "The selected half-day slot overlaps with an existing custom booking");
      }
    } else if (bookingType === BookingType.CUSTOM) {
      if (!startTime || !endTime) {
        throw new CustomError(400, "Start time and end time are required for custom bookings");
      }

      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);

      // Validate start time is before end time
      if (parsedStartTime >= parsedEndTime) {
        throw new CustomError(400, "Start time must be before end time");
      }

      // Check if full day booking exists
      const hasFullDay = await bookingRepo.hasFullDayBooking(parsedBookingDate);
      if (hasFullDay) {
        throw new CustomError(409, "The selected date already has a full-day booking");
      }

      // Check for overlapping half-day bookings
      const morningStart = new Date(parsedBookingDate);
      const morningEnd = new Date(parsedBookingDate);
      const afternoonStart = new Date(parsedBookingDate);
      const afternoonEnd = new Date(parsedBookingDate);
      
      morningStart.setHours(8, 0, 0, 0);
      morningEnd.setHours(12, 0, 0, 0);
      afternoonStart.setHours(13, 0, 0, 0);
      afternoonEnd.setHours(17, 0, 0, 0);

      // Check overlap with morning
      if (parsedStartTime < morningEnd && parsedEndTime > morningStart) {
        const hasFirstHalf = await bookingRepo.hasHalfDayBooking(parsedBookingDate, BookingSlot.FIRSTHALF);
        if (hasFirstHalf) {
          throw new CustomError(409, "Your custom booking overlaps with an existing morning half-day booking");
        }
      }

      // Check overlap with afternoon
      if (parsedStartTime < afternoonEnd && parsedEndTime > afternoonStart) {
        const hasSecondHalf = await bookingRepo.hasHalfDayBooking(parsedBookingDate, BookingSlot.SECONDHALF);
        if (hasSecondHalf) {
          throw new CustomError(409, "Your custom booking overlaps with an existing afternoon half-day booking");
        }
      }

      // Check for overlapping custom bookings
      const hasCustomOverlap = await bookingRepo.hasOverlappingCustomBooking(
        parsedBookingDate,
        parsedStartTime,
        parsedEndTime
      );
      
      if (hasCustomOverlap) {
        throw new CustomError(409, "Your custom booking overlaps with an existing custom booking");
      }
    } else {
      throw new CustomError(400, "Invalid booking type");
    }

    // Create booking data
    const bookingData: any = {
      customerName,
      customerEmail,
      bookingDate: parsedBookingDate,
      bookingType,
      userId
    };

    // Add conditional fields based on booking type
    if (bookingType === BookingType.HALFDAY) {
      bookingData.bookingSlot = bookingSlot;
    } else if (bookingType === BookingType.CUSTOM) {
      bookingData.startTime = new Date(startTime);
      bookingData.endTime = new Date(endTime);
    }

    // Create the booking
    const booking = await bookingRepo.createBooking(bookingData);

    return DefaultResponse(res, 201, "Booking created successfully", booking);
  } catch (error) {
    next(error);
  }
};

export const bookingService = {
  createBooking
};