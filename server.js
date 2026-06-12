import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5003
app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(PORT, () => console.log("Server Started"))
})

const taskSchema = mongoose.Schema({
    note: String
})

const taskModel = mongoose.model("Tasks", taskSchema)

app.post("/tasks", async(req, res) => {
    const task = await taskModel.create(req.body)
    res.json(task, {Message: "Task added"})
})

app.get("/tasks", async(req,res) => {
    const tasks = await taskModel.find()
    res.json(tasks)
})

app.delete("/tasks/:id", async(req,res) =>{
    const {id} = req.params
    const Tasks = await taskModel.findByIdAndDelete(id)
    res.json(Tasks)
})
