import prisma from "../lib/db";

export async function createUser(username: string, password: string) {
  return await prisma.user.create({
    data: {
      username,
      password
    }
  });
}

export async function getUserByUsername(username: string) {
  return await prisma.user.findUnique({
    where: { username }
  });
}