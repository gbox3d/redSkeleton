import express from 'express'
import dotenv from "dotenv"
import fs from 'fs-extra'

import fileControl from "./routers/fileControl.js"

dotenv.config({path:'./config.env'}); //환경 변수에 등록 
console.log(`run mode : ${process.env.NODE_ENV}`);

//디랙토리 생성 
{
    let _ = fs.ensureDirSync(process.env.UPLOAD_PATH)
    if(_) {
        console.log(`${_} created`)
    }
    // console.log(fs.ensureDirSync(process.env.UPLOAD_PATH));
}

const app = express()

app.use('/api/v1',fileControl);
app.use(express.static(process.env.STATIC_ASSET));


//순서 주의 맨 마지막에 나온다.
app.all('*', (req, res) => {
    res
        .status(404)
        .send('oops! resource not found')
});
app.listen(process.env.PORT,()=> {
    console.log(`server run at : ${process.env.PORT}`)
})