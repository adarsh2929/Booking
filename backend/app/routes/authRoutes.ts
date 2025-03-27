import express from 'express'

import { authService } from '../services/authService'
import { userValidationRules, loginValidationRules } from '../helper/validator'


const authRoutes = express.Router()

authRoutes.post('/user',userValidationRules,authService.createUser)

authRoutes.post('/login',loginValidationRules,authService.loginUser)

authRoutes.post('/verify',authService.verifyEmail)


export default authRoutes