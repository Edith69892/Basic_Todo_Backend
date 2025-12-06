import express from "express";
import { userModel } from "./models/user.models.js";
import { todoModel } from "./models/todo.models.js";
import jwt from "jsonwebtoken";
export const JWT_SECRET = "jhfdjfdaj";
import { auth } from "./auth.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt"
import {z} from "zod";

const app = express();

app.use(express.json());

mongoose.connect("mongodb+srv://Edith786:786Patil@cluster0.niapsjh.mongodb.net/BasicTodo")

//user Registration
app.post("/signUp", async (req, res) => {

    //input validation
    const requiredBody = z.object({
        email : z.string().min(3).max(20).email(),
        name : z.string().min(3).max(20),
        password : z.string().min(3).max(30)
    })

    const parseDataSuccess = requiredBody.safeParse(req.body);

    /*
        {
            success : true || false,
            data: {},
            error : []
        }
    */

    if(!parseDataSuccess.success){
        res.json({
            message: "Invalid formate.",
            error : parseDataSuccess.error
        })
        return
    }


    const name = req.body.name
    const email = req.body.email
    const password = req.body.password;

    const hashPassword = await bcrypt.hash(password, 10)

    await userModel.create({
        name: name,
        email: email,
        password: hashPassword
    })

    res.json({
        message: "User signiUpsuccessfully."
    })
})

//logIn

app.post("/signIn", async (req, res) => {
    const email = req.body.email
    const password = req.body.password;

    let token;

    const user = await userModel.findOne({
        email: email
    });

    const passMatch = await bcrypt.compare(password, user.password)

    if (user) {
        if (passMatch) {
            token = jwt.sign(
                {
                    _id: user._id,
                },
                JWT_SECRET
            )
        } else {
            res.json({ message: "Password incorrect." })
        }
    }
    else {
        res.json({
            message: "login failed."
        })
    }

    res.json({
        message: "sign in success fully.",
        token: token
    })
});

app.post("/todo", auth, async (req, res) => {

    const user = await userModel.findById(req.user._id)
    const title = req.body.title;
    const completed = req.body.completed;

    if (user) {
        await todoModel.create({
            title: title,
            completed: completed,
            userId: user._id
        })
    } else {
        res.json({
            message: "access faild."
        })
    }

    res.json({
        message: "create todo successfully."
    })

});

app.get("/todos", auth, async (req, res) => {
    const user = userModel.findById(req.user._id);

    const todos = await todoModel.find({ userId: user._id })
    // todos.toArray();
    res.json({
        todos
    })
});

//update todo

app.patch("/updateTodo/:todoId", auth, async (req, res) => {
    // const user = userModel.findById(req.user._id);

    const title = req.body.title;
    const completed = req.body.completed;

    const todoId = req.params.todoId;


    const todo = await todoModel.findById(todoId);

    if (title || completed) {
        await todoModel.findByIdAndUpdate(todo._id, {
            title: title || todo.title,
            completed: completed || todo.completed
        })

        await todo.save();

        res.json({
            message: "update successfully"
        })

    }

    res.json({
        message: "update Unsuccessfully"
    })
})

//delete todo 

app.delete("/deleteTodo/:todoId", auth, async (req, res) => {
    const todoId = req.params.todoId;

    const todo = await todoModel.findByIdAndDelete(todoId);

    res.json({
        message: "Delete successfull"
    })
})

app.listen(3000, () => {
    console.log("server connected");

})