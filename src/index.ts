import express from "express";
 
const app = express();
import studentRouter from "./routes/studentRoute.js";
import adminRouter from "./routes/adminRoute.js";



app.use(express.json());


app.use("/student", studentRouter);
app.use("/admin",adminRouter);

app.listen(3000,()=>{
    console.log("Server running at local host 3000");
});
// 
