import express from "express";
import { customError, notFound } from "../helper/errorHandler";

import authRoutes from "./authRoutes";
import bookingRoutes from "./bookingRoutes";


const router = express.Router();


router.use('/auth',authRoutes)
router.use('/bookings',bookingRoutes)

router.use(notFound);
router.use(customError);


export default router