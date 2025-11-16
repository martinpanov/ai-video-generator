'use server';

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "../lib/session";
import { createUser, getUserByUsername } from "../repositories/authRepository";
import { validation } from "../utils/validation";
import { registerValidationSchema } from "../register/validationSchema";
import bcrypt from 'bcrypt';

export async function register(
  state: Record<string, string> | undefined,
  formData: FormData
) {
  const data = {
    username: formData.get('username') as string,
    password: formData.get('password') as string
  };

  const { isValid, errors } = validation(data, registerValidationSchema);

  if (!isValid) {
    return errors;
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await createUser(data.username, hashedPassword);

  if (!user) {
    return {
      message: "An error occurred while creating your account."
    };
  }

  await createSession(user.id);

  redirect('/');
}

export async function login(
  state: Record<string, string> | undefined,
  formData: FormData
) {
  const data = {
    username: formData.get('username') as string,
    password: formData.get('password') as string
  };

  const user = await getUserByUsername(data.username);

  if (!user) {
    return {
      message: "Invalid username or password"
    };
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password);

  if (!passwordMatch) {
    return {
      message: "Invalid username or password"
    };
  }

  await createSession(user.id);

  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}