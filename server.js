import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5003
app.use(express.json())
app.use(cors())

const SECRET = "mySecret"

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(PORT, () => console.log("Server Started"))
})

const taskSchema = mongoose.Schema({
    note: String,
    //email: String
})

const taskModel = mongoose.model("Tasks", taskSchema)

const userSchema = mongoose.Schema({
    email: String,
    password: String
})

const userModel = mongoose.model("Users", userSchema)

const authenticate = async (req, res, next) => {
    try{
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const user = await jwt.verify(token, SECRET)
        req.user = user
        next()
    }
    catch(error){
        res.json({Message: "Unauthorized"})
    }
}

app.post("/tasks/register", async (req,res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    req.body.password = hashedPassword
    const user = await userModel.create(req.body)
    res.json(user)
})

app.post("/tasks/login", async (req,res) => {
    const {email, password} = req.body
    const user = await userModel.findOne({email})
    if(user){
        const checkPassword = await bcrypt.compare(password, user.password)
        if(checkPassword){
            const obj = {id: user._id, email: user.email}
            const token = await jwt.sign(obj, SECRET, {expiresIn: "1hr"} )
            res.json({...obj, token})
        }
        else{
            res.json({Message: "Invalid Password"})
        }
    }
    else res.json({Message: "User not found"})
})

app.post("/tasks", async(req, res) => {
    const task = await taskModel.create(req.body)
    res.json(task, {Message: "Task added"})
})

app.get("/tasks", authenticate, async(req,res) => {
    const tasks = await taskModel.find()
    res.json(tasks)
})

app.delete("/tasks/:id", async(req,res) =>{
    const {id} = req.params
    const Tasks = await taskModel.findByIdAndDelete(id)
    res.json(Tasks)
})
