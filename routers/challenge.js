import express from 'express'
import fs from "fs-extra";
import path from 'path';
import moment from 'moment'
import { dir } from 'console';



export default function (_Context) {


    const router = express.Router()


    const collectionName = 'game_slot'

    const dataBase = _Context.dataBase // mongodb database object

    //cors 정책 설정 미들웨어 
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
        res.json({ r: 'ok', info: 'challenge system' })
    })

    router.route('/register').get( async (req, res) => {

        try {
            const { studentId, name,passwd } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !name || !passwd) {
                return res.status(400).json({ r: 'err', info: '학번과 이름, 암호 필요합니다.' });
            }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {
                return res.status(409).json({ r: 'err', info: '이미 등록된 사용자입니다.' });
            }

            // 새 사용자 등록
            const newUser = {
                studentId,
                name,
                passwd,
                registeredAt: new Date() // 현재 시간 기록
            };
            await dataBase.collection(collectionName).insertOne(newUser);

            // 성공 응답
            res.json({ r: 'ok', info: '사용자 등록 성공' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    })

    router.route('/start_hl').get( async (req, res) => {

        try {
            const { studentId,passwd } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !passwd) {
                return res.status(400).json({ r: 'err', info: '학번과 암호가 필요합니다.' });
            }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId, passwd });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {

                //랜덤한 숫자를 생성한다.
                const randomNum = Math.floor(Math.random() * 10000)

                // hl_number 항목을 업데이트 한다. 생성한 시간도 함께 기록한다.
                await dataBase.collection(collectionName).updateOne({ studentId, passwd }, { $set: { hl_number: randomNum, hl_number_createdAt: new Date() } });
                

                // 성공 응답
                res.json({ r: 'ok', info: '비밀의 숫자를 생성했습니다.'});
                
            }
            else{
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }

            
        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });

    router.route('/find_hl').get( async (req, res) => {
        try {
            const { studentId,passwd,num } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !passwd || !num) {
                return res.status(400).json({ r: 'err', info: '학번과 암호, number 가 필요합니다.' });
            }

            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId, passwd });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {

                //db 에서 hl_number 를 가져와서 비교한다.
                const hl_number = existingUser.hl_number
                if(hl_number == num) {

                    //시간도 함께 기록한다.
                    await dataBase.collection(collectionName).updateOne({ studentId, passwd }, { $set: { hl_number_foundAt: new Date() } });
                    return res.json({ r: 'ok', info: '정답입니다.',dir : 0});
                }
                else {

                    if(hl_number > num)
                        return res.json({ r: 'ok', info: '정답보다 작습니다.',dir : 1});
                    else
                        return res.json({ r: 'ok', info: '정답보다 큽니다.',dir : -1});
                }
                
                
            }
            else{
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }

            
        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }


    });


    return router;

}




