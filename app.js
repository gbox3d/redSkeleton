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

//auth 인증 
app.use('/api',(req, res, next)=> {

    console.log('check api auth')
    // console.log(req.header('auth-token'))

    let authToken = req.header('auth-token')

    if(authToken === process.env.AUTH_TOKEN) {
        next() //인증성공 다음단계로...
    }
    else {
        // res.status(401).send('auth fail')
        res.status(401).json({ r: "err", msg: "auth fail" });
    }

});

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