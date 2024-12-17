import mongoose,{Schema,model} from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MongoUsername=process.env.Username;
const MongoPass=process.env.Password;
const url=`mongodb+srv://${MongoUsername}:${MongoPass}@cluster0.uydprj9.mongodb.net/resmng`;
const ConnectDB=async()=>{
    console.log("=>",MongoUsername,MongoPass)
    try{
        await mongoose.connect(`${url}`,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }); 
        console.log('DB connected');
    }
    catch(e){
        console.log(e?.message);
    }
}

const schema=new Schema({
    roomId:String,
    Username:String,
    Password:String,
    totalTables:String,
    type:{
        enum:["User","ResAdmin","Admin"],
        type:String,
    },
    resturantName:String,
    orderList: []
},{strict:false})
const Usermodel=model("resusers",schema);
export  {ConnectDB,Usermodel};