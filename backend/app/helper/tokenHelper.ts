import jwt from "jsonwebtoken";

export const generateAccessToken = (payload: any) => {
    // expiresIn works in seconds if given in number
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY as string, {
        expiresIn: 24 * 60 * 60,
    });
    return token;
  };


  export const verifyAccessToken = (accessToken: string) => {
    let verified;
    try {
      verified = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY as string);
    } catch (err) {
      console.log(err);
      verified = false;
    }
    return verified;
  };