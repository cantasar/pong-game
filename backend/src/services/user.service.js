import prisma from '../db/client.js';

export async function searchUsersByUsernameService(username) {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username
        }
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      },
      orderBy: {
        username: 'asc'
      }
    });

    return users;
  } catch (error) {
    throw new Error(`Error searching users: ${error.message}`);
  }
}

export async function getUserByUsernameService(username) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username
      },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    });

    return user;
  } catch (error) {
    throw new Error(`Error finding user: ${error.message}`);
  }
}
