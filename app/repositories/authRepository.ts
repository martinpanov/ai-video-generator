import { prisma } from "../lib/db";
import { verifySession } from "../lib/session";

export async function createUser(username: string, password: string) {
  return prisma.user.create({
    data: {
      username,
      password
    }
  });
}

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username }
  });
}

export async function getCurrentUser() {
  const userId = await verifySession();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId }
  });
}