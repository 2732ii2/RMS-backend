import { S3Client, ListBucketsCommand ,PutObjectCommand} from "@aws-sdk/client-s3";
const client = new S3Client({ region: "REGION" });
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
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
  
const PutObjectFunc=async(file)=>{
    try{
        console.log("thing are begins");
        const params={
            Bucket:BucketName,
            Key:file.originalname,
            Body:file.buffer,
            // ContentType:file.mimetype,
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

// import AWS from "aws-sdk";

// const s31 = new AWS.S3({
//  credentials: {
//     accessKeyId: AccessKey,
//     secretAccessKey:SecretKey,
//   },
//   region: Reg, // Ensure this matches your bucket's region
//   requestHandler: new NodeHttpHandler({
//       connectionTimeout: 300000, // 5 minutes
//       socketTimeout: 300000,    // 5 minutes
//   }),

// });

// const PutObjectFunc = async (file) => {
//   const params = {
//     Bucket: BucketName,
//     Key: file.originalname,
//     Body: file.buffer,
//   };

//   try {
//     const result = await s31.upload(params).promise();
//     console.log("File uploaded successfully:", result);
//   } catch (error) {
//     console.error("File upload error:", error.message);
//   }
// };

export {testS3Connection,PutObjectFunc}