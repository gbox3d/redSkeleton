import express from 'express'
import dotenv from "dotenv"
import fs from 'fs-extra'

import { MongoClient } from 'mongodb'

import fileControl from "./routers/fileControl.js"
import challengeSetup from "./routers/challenge.js"


const theApp = {
    version : '0.0.1',
    dbclient: null,
    dataBase: null
}

async function main() {
    dotenv.config(); //.env 파일을 읽어서 환경변수에 등록한다.
    console.log(`run mode : ${process.env.NODE_ENV}`);

    

    //mongodb setup
    //mongodb 연결    
    {
        //db name check
        if (!process.env.DB_NAME || process.env.DB_NAME === '') {
            console.log('DB_NAME is not defined');
            process.exit(1);
        }

        const mongoUrl = process.env.MONGO_URL;

        const connectWithRetry = async () => {
            try {
                const dbclient = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
                console.log(`Connected successfully to server ${mongoUrl} , DB Name : ${process.env.DB_NAME}`);
                theApp.dbclient = dbclient;
                theApp.dataBase = dbclient.db(process.env.DB_NAME);
            } catch (err) {
                console.log('Failed to connect to MongoDB, retrying in 5 seconds...', err);
                setTimeout(connectWithRetry, 5000);
            }
        };

        await connectWithRetry();

    }


    //디랙토리 생성 
    {
        let _ = fs.ensureDirSync(process.env.UPLOAD_PATH)
        if (_) {
            console.log(`${_} created`)
        }
        // console.log(fs.ensureDirSync(process.env.UPLOAD_PATH));
    }

    const app = express()

    //auth 인증 
    app.use('/api', (req, res, next) => {

        console.log('check api auth')
        // console.log(req.header('auth-token'))

        let authToken = req.header('auth-token')

        if (authToken === process.env.AUTH_TOKEN) {
            next() //인증성공 다음단계로...
        }
        else {
            // res.status(401).send('auth fail')
            res.status(401).json({ r: "err", msg: "auth fail" });
        }

    });

    app.use('/api/v2/fc', fileControl);
    app.use('/api/v2/challenge', challengeSetup(theApp));

    if (process.env.PATH_ROUTER) {

        try {
            let _pathRouters = await fs.readJson(process.env.PATH_ROUTER);

            //라우터 설정
            for (let i = 0; i < _pathRouters.length; i++) {
                // app.use(_pathRouters[i].path, require(`./routers/${_pathRouters[i].router}`));
                app.use('/' + _pathRouters[i].name, express.static(_pathRouters[i].path));

                console.log(`${_pathRouters[i].name} : ${_pathRouters[i].path}`);
            }

            console.log('static router setup complete ');

        }
        catch (err) {
            console.log(err);
        }
    }


    //순서 주의 맨 마지막에 나온다.
    app.all('*', (req, res) => {
        res
            .status(404)
            .send('oops! resource not found')
    });
    app.listen(process.env.PORT, () => {
        console.log(`server run at : ${process.env.PORT}`)
    })


}

main()