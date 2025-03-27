import { NextFunction, Request, Response } from 'express';
import { CustomError } from './customError';


export const customError = (
	err: CustomError,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const error = new CustomError(err.status, err.message, err.additionalInfo);
	console.log('error: ', error);

	if (error.status == 500) {
		return res.status(error.status).json({
			status: error.status,
			message: 'Something went wrong',
			details: error.additionalInfo
		});
	} else {
		return res.status(error.status).json({
			status: error.status,
			message: error.message,
			details: error.additionalInfo
		});
	}
};


export const notFound = (req: Request, res: Response, next: NextFunction) => {
	const error = new CustomError(404, `Path not found`);
	next(error);
};

