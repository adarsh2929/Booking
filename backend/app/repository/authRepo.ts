import { prisma } from '../client/prisma';


const checkEmailExists = async (email: string) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });
        return user
    } catch (error) {
        throw error
    }
};
  
  // Create a new user
  const createUser = async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    accessToken: string;
  }) => {
    return await prisma.user.create({
      data: {
        ...data,
        isVerified: false,
        accessToken: data.accessToken
      }
    });
  };

  const getUserById = async (id: string) => {
    return await prisma.user.findUnique({
      where: { id }
    });
  };

  const updateUserVerification = async (id: string) => {
    return await prisma.user.update({
      where: { id },
      data: { isVerified: true }
    });
  };

 

export const authRepo = {
    createUser,
    checkEmailExists,
    getUserById,
    updateUserVerification,
    
}