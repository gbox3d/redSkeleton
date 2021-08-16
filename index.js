import YAML from 'yaml'
import fs from 'fs'
import { CCoreApp } from './coreApp.js';
import dotenv from 'dotenv'


dotenv.config({path:'./config.env'}) //환경 변수에 등록 
// console.log(process.env.PORT)
console.log(`run mode : ${process.env.NODE_ENV}`)

// let settings = {
//     port: 8080,
//     upload_path: './uploads',
//     web_content_path: './web_content',
// }
// if (!fs.existsSync('settings.yaml')) {
//     console.log('create settings.yaml')
//     fs.writeFileSync('settings.yaml',YAML.stringify(settings))
// }
// else {
//     settings = YAML.parse(fs.readFileSync('settings.yaml','utf-8'))
// }


let app = new CCoreApp({
    port: process.env.PORT,
    upload_path: process.env.UPLOAD_PATH,
    web_content_path: process.env.STATIC_ASSET
});
