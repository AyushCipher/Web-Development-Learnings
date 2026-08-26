import type { Context } from "hono";
import { Database } from "bun:sqlite";
import { Task } from "../types";

export async function createTask(c: Context, db: Database) {
  const userId = c.get("jwtPayload").userId;
  const userRole = c.get("jwtPayload").role;
  const { title, description, user_id } = await c.req.json();

  if (!userId) {
    return c.json(
      {
        error: "Unauthenticated! You need to login to create task",
      },
      401
    );
  }

  if (userRole !== "admin") {
    return c.json(
      {
        error: "Unauthorized! Only admin users can create a post",
      },
      403
    );
  }

  if (userId !== user_id) {
    return c.json(
      {
        error: "Invalid user with diff user id",
      },
      403
    );
  }

  try {
    const result = db
      .query(
        `
            INSERT INTO tasks (user_id, title, description) VALUES (?,?,?) RETURNING *
            `
      )
      .get(user_id, title, description) as Task;

    return c.json(result, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function getAllTasks(c: Context, db: Database) {
  try {
    const extractAllTasks = db.query("SELECT * FROM tasks").all() as Task[];
    return c.json(extractAllTasks, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function getTask(c: Context, db: Database) {
  const taskId = c.req.param("id");

  try {
    const extractSingleTask = db
      .query("SELECT * FROM tasks WHERE id =?")
      .get(taskId) as Task | undefined;

    if (!extractSingleTask) {
      return c.json(
        {
          error: "Task not found! Please try again",
        },
        404
      );
    }

    return c.json(extractSingleTask, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function updateATask(c: Context, db: Database) {
  const userId = c.get("jwtPayload").userId;
  const userRole = c.get("jwtPayload").role;
  const taskId = c.req.param("id");
  const { title, description, user_id } = await c.req.json();

  if (!userId) {
    return c.json(
      {
        error: "Unauthenticated! You need to login to create task",
      },
      401
    );
  }

  if (userRole !== "admin") {
    return c.json(
      {
        error: "Unauthorized! Only admin users can update a post",
      },
      403
    );
  }

  if (userId !== user_id) {
    return c.json(
      {
        error: "You are not owner of this post, you can't update this!",
      },
      403
    );
  }

  try {
    const extractSingleTask = db
      .query("SELECT * FROM tasks WHERE id= ?")
      .get(taskId) as Task | undefined;

    if (!extractSingleTask) {
      return c.json(
        {
          error: "Task not found! Please try again",
        },
        404
      );
    }

    const updatedTask = db
      .query(
        `
        UPDATE tasks
        SET title = ?, description = ?, user_id = ?
        WHERE id = ?
        RETURNING *
        `
      )
      .get(
        title || extractSingleTask.title,
        description !== undefined ? description : extractSingleTask.description,
        user_id || extractSingleTask.user_id,
        taskId
      ) as Task;

    return c.json(updatedTask, 200);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}

export async function deleteTask(c: Context, db: Database) {
  const userId = c.get("jwtPayload").userId;
  const userRole = c.get("jwtPayload").role;
  const taskId = c.req.param("id");
  const { user_id } = await c.req.json();

  if (!userId) {
    return c.json(
      {
        error: "Unauthenticated! You need to login to create task",
      },
      401
    );
  }

  if (userRole !== "admin") {
    return c.json(
      {
        error: "Unauthorized! Only admin users can delete a post",
      },
      403
    );
  }

  if (userId !== user_id) {
    return c.json(
      {
        error: "You are not owner of this post, you can't delete this!",
      },
      403
    );
  }

  try {
    const deletedTask = db.query("DELETE FROM tasks WHERE id= ?").run(taskId);

    if (deletedTask.changes === 0) {
      return c.json(
        {
          error: "Task not found! Please try again",
        },
        404
      );
    }

    return c.json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error(error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
