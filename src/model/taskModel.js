"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
// Define the schema for the tasks
const TaskSchema = new mongoose_1.default.Schema({
    tasks: {
        type: [String], // Array of strings
        required: true,
    },
});
// Create and export the Mongoose model
const TaskModel = mongoose_1.default.model("assignment_shubham", TaskSchema);
exports.default = TaskModel;
