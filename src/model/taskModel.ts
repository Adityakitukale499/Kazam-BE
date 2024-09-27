import mongoose, { Document, Schema, Model } from "mongoose";

// Define the interface for the Task document
interface ITask extends Document {
  tasks: string[]; // Array of strings, modify if necessary
}

// Define the schema for the tasks
const TaskSchema: Schema = new mongoose.Schema({
  tasks: {
    type: [String], // Array of strings
    required: true,
  },
});

// Create and export the Mongoose model
const TaskModel: Model<ITask> =
  mongoose.model < ITask > ("assignment_shubham", TaskSchema);

export default TaskModel;
