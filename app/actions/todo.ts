"use server";

import { TodoSubmitState } from "../(main)/todos/components/TodoDialog";
import { todoValidationSchema } from "../(main)/todos/todoValidationSchema";
import { prisma } from "../lib/db";
import { verifySession } from "../lib/session";
import { validation } from "../utils/validation";
import { revalidatePath } from "next/cache";

export async function handleTodoSubmit(
  state: TodoSubmitState,
  formData: FormData
) {
  const todo = formData.get('todo');
  const id = formData.get('id');
  const { isValid, errors } = validation({ todo }, todoValidationSchema);

  if (!isValid) {
    return { success: false, ...errors };
  }

  try {
    const userId = await verifySession();

    if (!userId) {
      return { success: false, message: "You don't have access to modify todos" };
    }

    if (id) {
      // Update existing todo
      await prisma.todos.update({
        where: { id: id as string },
        data: { todo: todo as string }
      });
    } else {
      // Create new todo
      await prisma.todos.create({
        data: {
          todo: todo as string,
          userId
        }
      });
    }

    revalidatePath('/todos');
    return { success: true };
  } catch (error) {
    console.error('Failed to save todo:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save todo'
    };
  }
}

export async function deleteTodo(todoId: string) {
  const userId = await verifySession();

  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const todo = await prisma.todos.findUnique({
    where: { id: todoId },
  });

  if (!todo || todo.userId !== userId) {
    return { success: false, message: "Todo not found or unauthorized" };
  }

  await prisma.todos.delete({
    where: { id: todoId },
  });

  revalidatePath('/todos');
  return { success: true };
}

export async function deleteTodos(todoIds: string[]) {
  const userId = await verifySession() || "";
  const todos = await prisma.todos.findMany({
    where: {
      id: { in: todoIds },
      userId,
    },
  });

  if (todos.length !== todoIds.length) {
    throw new Error("Some todos not found or unauthorized");
  }

  await Promise.all(
    todos.map(todo => deleteTodo(todo.id))
  );

  await prisma.todos.deleteMany({
    where: {
      id: { in: todoIds },
      userId,
    },
  });

  revalidatePath("/todos");

  return { success: true, count: todos.length };
}