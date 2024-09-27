import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import bodyParser from "body-parser";
import TaskModel from "./model/taskModel";
import redisClient from "./config/redis";
import connectDB from "./config/db";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();
connectDB();

const app = express();
app.use(
  cors({
    origin: "https://delightful-chimera-654345.netlify.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(bodyParser.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://delightful-chimera-654345.netlify.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

interface Task {
  title: string;
  description: string;
}

io.on("connection", (socket: Socket) => {
  console.log("New client connected");

  socket.on("add", async (task: Task) => {
    try {
      const tasks = await redisClient.get("FULLSTACK_TASK_SHUBHAM");
      let taskArray: Task[] = tasks ? JSON.parse(tasks) : [];

      taskArray.push(task);

      if (taskArray.length > 50) {
        const newTaskDoc = new TaskModel({ tasks: taskArray });
        await newTaskDoc.save();
        await redisClient.del("FULLSTACK_TASK_SHUBHAM");
        console.log("Tasks moved to MongoDB and Redis cache cleared.");
      } else {
        await redisClient.set(
          "FULLSTACK_TASK_SHUBHAM",
          JSON.stringify(taskArray)
        );
        console.log("Tasks updated in redisClient.");
      }

      io.emit("taskAdded", task);
    } catch (error) {
      console.error("Error while adding task:", error);
    }
  });

  socket.on("deleteTask", async (index: number) => {
    try {
      const tasks = await redisClient.get("FULLSTACK_TASK_SHUBHAM");
      let taskArray: Task[] = tasks ? JSON.parse(tasks) : [];

      taskArray.splice(index, 1);

      await redisClient.set(
        "FULLSTACK_TASK_SHUBHAM",
        JSON.stringify(taskArray)
      );

      io.emit("taskDeleted", index);
    } catch (error) {
      console.error("Error while deleting task:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.get("/fetchAllTasks", async (req: Request, res: Response) => {
  try {
    let tasks = await redisClient.get("FULLSTACK_TASK_SHUBHAM");

    if (!tasks) {
      console.log("Fetching tasks from MongoDB.");
      const mongoTasks = await TaskModel.find({});
      tasks =
        mongoTasks.length > 0 ? JSON.stringify(mongoTasks[0].tasks) : "[]";
    } else {
      console.log("Fetched tasks from redisClient.");
    }

    res.json(JSON.parse(tasks));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Error fetching tasks");
  }
});

app.get("/", (req, res) => {
  res.send("<h1>This is Kazam assignment Backend</h1>");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
