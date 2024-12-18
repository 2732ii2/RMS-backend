import express from "express";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {ConnectDB,Usermodel} from "./DB.js";
import random from 'js-crypto-random';
import {QRPDFGen} from "./QRPDFGenerator.js";
import multer from "multer";
import { GetObjs, PutObjectFunc, testS3Connection } from "./S3controller.js";

import events from "events";
events.EventEmitter.defaultMaxListeners = 20; 

const upload = multer(); 


const app=express();
app.use(cors());
app.use(bodyParser.json({extented:true}));
app.use(bodyParser.urlencoded({extented:true}));
dotenv.config();
const port=4100;

testS3Connection();
ConnectDB();
app.get("/",(req,res)=>{
    res.json("hello world ");
    // testS3Connection();
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


app.post("/add_recipe",upload.any(),async (req,res)=>{
    console.log("adding recipe",req.files[0]);
    var {usersess,type,Prices,Sizes,name,des}=req.body;
    console.log(JSON.parse(usersess),type,JSON.parse(Prices),JSON.parse(Sizes),(name),(des));
    try{
    const {token}=JSON.parse(usersess);
    if(jwt.verify(token,"secret")){
        console.log("=> verified");
        PutObjectFunc(req.files[0]);
        const obj_={
            "type":(type),
            "Prices":JSON.parse(Prices),
            "Sizes":JSON.parse(Sizes),
            "name":(name),
            "des":(des),
            "key":req.files[0].originalname
        };
       const dish= await Usermodel.findOne({_id:JSON.parse(usersess)?._id});
       console.log("dish =>",dish?.Available_Dishes);
       var query={};
       if(!dish?.Available_Dishes?.length)
        {
            console.log("1");
            query={$set:
                {
                    "Available_Dishes":[obj_]
                }
                };
        }
        else{
            console.log("2");
            query={$set:
                {
                    "Available_Dishes":[...(dish?.Available_Dishes),obj_]
                }
                };
        }
        const resp= await Usermodel.updateOne({_id:JSON.parse(usersess)?._id},query);
       console.log( "=>" ,resp);
        res.json({
           msg:"some udpation is done it",
        })
    }
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
app.get("/available_dishes",async (req,res)=>{
    // const usersess=JSON.parse(req.headers["usersess"]);
    // console.log(usersess);
    try{
        // if (jwt.verify(usersess?.token,"secret")){
            // const data=(await Usermodel.findOne({_id:usersess?._id}))?.Available_Dishes;
            const data=(await Usermodel.findOne({_id:"675c1c311c90b639647927fd"}))?.Available_Dishes;

            console.log("data",data);
            var data1=await GetObjs(data);
            res.json({
                msg:"user List Recieved ",
                data1
            })
        // }
        
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
