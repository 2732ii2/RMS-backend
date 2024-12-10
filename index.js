import express from "express";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {ConnectDB,Usermodel} from "./DB.js";
import random from 'js-crypto-random';
import {QRPDFGen} from "./QRPDFGenerator.js";
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
app.post("/userUpdation",async (req,res)=>{
    console.log("User updation")
    try{
        const {usersess, one,two}=(req.body);
    const {token}=usersess;
    if(jwt.verify(token,"secret")){
       console.log(one, two, usersess);
     const resp= await Usermodel.updateOne({_id:usersess?._id},{$set:{
    totalTables:two,
                resturantName:one
       }})
       console.log( "=>" ,resp);
      const data= await QRPDFGen(one,two);
        res.json({
           msg:"some udpation is done it",
           data: data.toString("base64"), 
        })
    }
    // const data =
   
    }
    catch(e){
        res.json({
            err:e?.message
        })
    }
})


app.get("/deleteResAdmin",async(req,res)=>{
    try{
        const resp= await Usermodel.deleteMany({type:"ResAdmin"});
        res.json({
            msg: resp
        })
    }
    catch(e){
        res.json({
            err:e?.message
        })
    }
})


app.post("/userCreation",async(req,res)=>{
    try{
        const {Username,Password}= (req.body);
    console.log(Username,Password);
    const encpass=await bcrypt.hash(Password,10);
    const randomStr = random.getRandomAsciiString(7);
    console.log(randomStr);
    const verifiedUser= new Usermodel({Username,Password:encpass,roomId:randomStr,type:"ResAdmin",orderList:[]});
    console.log(verifiedUser);
    await verifiedUser.save();
    res.json({
       msg:"User has been added "
    })
    }
    catch(e){
        res.json({
            err:e?.message
        })
    }
})
app.get("/userList",async (req,res)=>{
    const token=(req.headers["token"]);
    try{
        if (jwt.verify(token,"secret")){
            console.log("verified");
            const data=(await Usermodel.find({type:"ResAdmin"}));
            res.json({
                msg:"user List Recieved ",
                data
            })
        }
        
    }
    catch(e){
        res.json({
            err:e?.message
        })
    }
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
