import { Response } from "express";
import { DefaultResponseInterface } from "../interface/global";

export const DefaultResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
) => {
  let response: DefaultResponseInterface = {
    message: message,
    statusCode: statusCode,
    data: data,
  };

  return res.status(statusCode).json(response);
};
