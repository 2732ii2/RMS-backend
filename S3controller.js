import { S3Client, ListBucketsCommand ,PutObjectCommand,GetObjectCommand} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import sharp from "sharp";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const BucketName=`${process.env.Bucketname}`;
const Reg=`${process.env.Region}`;
const SecretKey=`${process.env.SecretKey}`;
const AccessKey=`${process.env.AccessKey}`;


const s3 = new S3Client({
    credentials: {
      accessKeyId: AccessKey,
      secretAccessKey:SecretKey,
    },
    region: Reg, // Ensure this matches your bucket's region
    requestHandler: new NodeHttpHandler({
        connectionTimeout: 300000, // 5 minutes
        socketTimeout: 300000,    // 5 minutes
    }),
  });
  
  const testS3Connection = async () => {
    try {
      const command = new ListBucketsCommand({});
      const response = await s3.send(command);
      console.log("S3 connection successful:", response.Buckets);
    } catch (error) {
      console.error("S3 connection failed:", error.message);
    }
  };
const GetObjs=async (lists)=>{
  console.log("=>",lists);
  try{
    for( const ele of lists){
      console.log("ele",ele);
      const getObjectParams={
        Bucket:BucketName,
        Key:ele.key
      }
      const commandGetObj = new GetObjectCommand(getObjectParams);
      // const url = await getSignedUrl(client, commandGetObj, { expiresIn: 3600 });
      const url = await getSignedUrl(s3, commandGetObj, { expiresIn: 86400 }); 
      console.log(url);
      ele.imgurl=`${url}`;
    }
    // console.log( "lists",lists);
    return lists;
  }
  catch(e){
    console.log(e?.message);
  }
}
const PutObjectFunc=async(file)=>{
    try{
        console.log("thing are begins");
        const params={
            Bucket:BucketName,
            Key:file.originalname,
            Body:file.buffer,
            ContentType: "image/jpeg",
        };
        console.log(params);
        const command =new PutObjectCommand(params);
        const resp=await s3.send(command);
        console.log("file successfully saved",resp);
    }
    catch(e){
        console.log(e?.message);
    }
}


export {testS3Connection,PutObjectFunc,GetObjs}