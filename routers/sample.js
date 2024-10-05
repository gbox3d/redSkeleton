import express from 'express'

export default function (_Context) {
    const router = express.Router()

    router.use((req, res, next) => {

        res.set('Access-Control-Allow-Origin', '*'); //cors 전체 허용
        res.set('Access-Control-Allow-Methods', '*');
        res.set("Access-Control-Allow-Headers", "*");

        console.log(req.header('content-type'))
        console.log(`check file control mw auth ${req.originalUrl}`)
        next()
    })

    //raw 바디 미들웨어, content-type : application/octet-stream 일 경우 req.body로 받아온다.
    router.use(express.raw({ limit: '500kb' })) //파일용량 1기가 바이트로 제한
    router.use(express.json()) //json 바디 미들웨어, content-type : application/json 일 경우 req.body로 받아온다.
    router.use(express.text()) //text 바디 미들웨어, content-type : application/text 일 경우 req.body로 받아온다.

    router.route('/').get((req, res) => {
        res.json({ r: 'ok', info: 'it is sample' })
    })

    // http://localhost:8008/api/v2/sample/add?a=1&b=2
    router.route('/add').get(async (req, res) => {
        let { a, b } = req.query
        let c = parseInt(a) + parseInt(b)
        res.json({ r: 'ok', c })
    })


    return router
}