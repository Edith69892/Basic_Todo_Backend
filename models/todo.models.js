import mongoose from "mongoose";
const ObjectId = mongoose.ObjectId
const todoSchema = new mongoose.Schema({
    title : String,
    completed : Boolean,
    userId : ObjectId
});

export const todoModel = mongoose.model("Todo", todoSchema)