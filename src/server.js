"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const body_parser_1 = __importDefault(require("body-parser"));
const taskModel_1 = __importDefault(require("./model/taskModel"));
const redis_1 = __importDefault(require("./config/redis"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(body_parser_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
    },
});
io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("add", (task) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tasks = yield redis_1.default.get("FULLSTACK_TASK_SHUBHAM");
            let taskArray = tasks ? JSON.parse(tasks) : [];
            taskArray.push(task);
            if (taskArray.length > 50) {
                const newTaskDoc = new taskModel_1.default({ tasks: taskArray });
                yield newTaskDoc.save();
                yield redis_1.default.del("FULLSTACK_TASK_SHUBHAM");
                console.log("Tasks moved to MongoDB and Redis cache cleared.");
            }
            else {
                yield redis_1.default.set("FULLSTACK_TASK_SHUBHAM", JSON.stringify(taskArray));
                console.log("Tasks updated in redisClient.");
            }
            io.emit("taskAdded", task);
        }
        catch (error) {
            console.error("Error while adding task:", error);
        }
    }));
    socket.on("deleteTask", (index) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const tasks = yield redis_1.default.get("FULLSTACK_TASK_SHUBHAM");
            let taskArray = tasks ? JSON.parse(tasks) : [];
            taskArray.splice(index, 1);
            yield redis_1.default.set("FULLSTACK_TASK_SHUBHAM", JSON.stringify(taskArray));
            io.emit("taskDeleted", index);
        }
        catch (error) {
            console.error("Error while deleting task:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
app.get("/fetchAllTasks", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tasks = yield redis_1.default.get("FULLSTACK_TASK_SHUBHAM");
        if (!tasks) {
            console.log("Fetching tasks from MongoDB.");
            const mongoTasks = yield taskModel_1.default.find({});
            tasks =
                mongoTasks.length > 0 ? JSON.stringify(mongoTasks[0].tasks) : "[]";
        }
        else {
            console.log("Fetched tasks from redisClient.");
        }
        res.json(JSON.parse(tasks));
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).send("Error fetching tasks");
    }
}));
app.get("/", (req, res) => {
    res.send("<h1>This is Kazam assignment Backend</h1>");
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
