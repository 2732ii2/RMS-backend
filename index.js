import express from "express";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {ConnectDB,Usermodel} from "./DB.js";
const app=express();
app.use(cors());
app.use(bodyParser.json({extented:true}));
app.use(bodyParser.urlencoded({extented:true}));
dotenv.config();
const port=4100;


ConnectDB();
app.get("/",(req,res)=>{
    res.json("hello world ");
})
app.post("/login",async(req,res)=>{
    try{
        const {Username,Password}=(req.body);
        const dbresp=await Usermodel.find({Username:Username});
        console.log(dbresp);
        if(dbresp.length){
           // user has found 
           const encpass=await bcrypt.hash(Password,10);
        //    console.log(encpass,Password,dbresp[0]?.Password);
            console.log(dbresp[0],Password);
            const verifypass=await bcrypt.compare(Password,dbresp[0]?.Password);
            console.log(verifypass);
            if(verifypass){
                const token=jwt.sign({Username,Password:dbresp[0]?.Password},"secret");
                console.log(token)
                res.json({msg:"successfully logged in ",token,usersession:dbresp[0]});
            }
            else{
                res.json({
                    err:"credentials are not matched"
                })
            }
        }
        else{
            res.json({
                err:"User not found"
            })
        }
    }
    catch(e){
    res.json({err:e?.message});

    }
})
app.listen(port,()=>{
    console.log(` http://localhost:${port}/`);
})
