import express from 'express'
import { bookingService } from '../services/bookingService'

const bookingRoutes = express.Router()

bookingRoutes.post('/create',bookingService.createBooking)

export default bookingRoutes