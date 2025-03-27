import { prisma } from '../client/prisma';
import { BookingType, BookingSlot } from '@prisma/client';

// Get all bookings for a specific date
const getBookingsByDate = async (bookingDate: Date) => {
    try {
        return await prisma.booking.findMany({
            where: {
              bookingDate: {
                equals: bookingDate
              }
            }
          });
        
    } catch (error) {
        throw error;
    }
 
};

// Check if a full day booking exists for a date
const hasFullDayBooking = async (bookingDate: Date) => {
    try {
        const booking = await prisma.booking.findFirst({
            where: {
              bookingDate: {
                equals: bookingDate
              },
              bookingType: BookingType.FULLDAY
            }
          });
          return booking !== null;
        
    } catch (error) {
        throw error;
    }
  
};

// Check if a half-day booking exists for a date and slot
const hasHalfDayBooking = async (bookingDate: Date, slot?: BookingSlot) => {
    try {
        const whereClause: any = {
            bookingDate: {
              equals: bookingDate
            },
            bookingType: BookingType.HALFDAY
          };
          
          if (slot) {
            whereClause.bookingSlot = slot;
          }
          
          const booking = await prisma.booking.findFirst({
            where: whereClause
          });
          return booking !== null;
        
    } catch (error) {
        throw error;
    }
 
};

// Check for custom bookings that overlap with a specific time period
const hasOverlappingCustomBooking = async (
  bookingDate: Date, 
  startTime?: Date, 
  endTime?: Date
) => {
    try {
        if (!startTime || !endTime) return false;
  
  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: {
        equals: bookingDate
      },
      bookingType: BookingType.CUSTOM,
      AND: [
        {
          startTime: {
            lt: endTime
          }
        },
        {
          endTime: {
            gt: startTime
          }
        }
      ]
    }
  });
  
  return bookings.length > 0;
        
    } catch (error) {
        throw error;
    }
  
};

// Create new booking
const createBooking = async (data: any) => {
    try {
        return await prisma.booking.create({
            data
        });
    } catch (error) {
        throw error;
    }
};

export const bookingRepo = {
  getBookingsByDate,
  hasFullDayBooking,
  hasHalfDayBooking,
  hasOverlappingCustomBooking,
  createBooking
};