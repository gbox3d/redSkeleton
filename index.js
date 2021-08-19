import { CCoreApp } from './coreApp.js';
import dotenv from 'dotenv'

dotenv.config({path:'./config.env'}); //환경 변수에 등록 
console.log(`run mode : ${process.env.NODE_ENV}`);

let app = new CCoreApp({
    port: process.env.PORT,
    upload_path: process.env.UPLOAD_PATH,
    web_content_path: process.env.STATIC_ASSET
});
