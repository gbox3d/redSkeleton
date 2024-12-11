import express from 'express'
import fs from "fs-extra";
import path from 'path';
import moment from 'moment'
import { dir } from 'console';

import { ObjectId } from 'mongodb';



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
        console.log(`check challenge mw auth ${req.originalUrl}`)
        next()
    })

    //raw 바디 미들웨어, content-type : application/octet-stream 일 경우 req.body로 받아온다.
    router.use(express.raw({ limit: '500kb' })) //파일용량 1기가 바이트로 제한
    router.use(express.json()) //json 바디 미들웨어, content-type : application/json 일 경우 req.body로 받아온다.
    router.use(express.text()) //text 바디 미들웨어, content-type : application/text 일 경우 req.body로 받아온다.

    router.route('/').get((req, res) => {
        res.json({ r: 'ok', info: 'challenge system' })
    })

    router.route('/register').get(async (req, res) => {

        try {
            const { studentId, name, passwd, classId } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !name || !passwd) {
                // return res.status(400).json({ r: 'err', info: '학번과 이름, 암호 필요합니다.' });
                console.log(`학번과 이름, 암호 필요합니다. ${studentId}`)
                return res.json({ r: 'err', info: '학번과 이름, 암호 필요합니다.' });
            }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {
                // return res.status(409).json({ r: 'err', info: '이미 등록된 사용자입니다.' });
                console.log(`이미 등록된 사용자입니다. ${studentId}`)
                return res.json({ r: 'err', info: '이미 등록된 사용자입니다.' });
            }

            // 새 사용자 등록
            const newUser = {
                studentId,
                name,
                passwd,
                registeredAt: new Date() // 현재 시간 기록
            };

            newUser.coin = 1
            newUser.classId = classId

            await dataBase.collection(collectionName).insertOne(newUser);

            // console.log(`사용자 등록: ${studentId}, ${name}`);
            console.log(`사용자 등록: `, newUser);

            // 성공 응답
            res.json({ r: 'ok', info: '사용자 등록 성공' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    })

    router.route('/start_hl').get(async (req, res) => {

        try {
            const { studentId, passwd } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !passwd) {
                return res.status(400).json({ r: 'err', info: '학번과 암호가 필요합니다.' });
            }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId, passwd });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {

                //코인이 있는지 확인한다.
                if (!existingUser.coin != undefined && existingUser.coin > 0) {

                    //랜덤한 숫자를 생성한다.
                    const randomNum = Math.floor(Math.random() * 10000)

                    // hl_number 항목을 업데이트 한다. 생성한 시간도 함께 기록한다.
                    await dataBase.collection(collectionName).updateOne({ studentId, passwd }, {
                        $set: {
                            hl_number: randomNum,
                            hl_number_createdAt: new Date(),
                            coin: existingUser.coin - 1
                        }
                    });

                    console.log(`hl_number : ${randomNum}`)


                    // 성공 응답
                    res.json({ r: 'ok', info: '비밀의 숫자를 생성했습니다.' });
                }
                else {
                    return res.json({ r: 'err', info: '코인이 부족합니다.' });
                }

            }
            else {
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }


        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });

    router.route('/find_hl').get(async (req, res) => {
        try {
            const { studentId, passwd, num } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !passwd || !num) {
                return res.status(400).json({ r: 'err', info: '학번과 암호, number 가 필요합니다.' });
            }

            // 1초 대기
            // await new Promise((resolve, reject) => {
            //     setTimeout(() => {
            //         resolve();
            //     }, 1000);
            // });

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId, passwd });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {

                //db 에서 hl_number 를 가져와서 비교한다.
                const hl_number = existingUser.hl_number
                if (hl_number == num) {

                    const _found_at = new Date()

                    //시간도 함께 기록한다.
                    await dataBase.collection(collectionName).updateOne({ studentId, passwd }, { $set: { hl_number_foundAt: _found_at } });

                    //기록추가
                    const record = {
                        type: 'hl_record',
                        id: studentId,
                        classId: existingUser.classId,
                        name: existingUser.name,
                        record_time: _found_at - existingUser.hl_number_createdAt,
                    }
                    await dataBase.collection(collectionName).insertOne(record);


                    return res.json({ r: 'ok', info: '정답입니다.', dir: 0 });
                }
                else {

                    if (hl_number > num)
                        return res.json({ r: 'ok', info: '정답보다 작습니다.', dir: 1 });
                    else
                        return res.json({ r: 'ok', info: '정답보다 큽니다.', dir: -1 });
                }


            }
            else {
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }


        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }


    });

    router.route('/get_coin').get(async (req, res) => {
        try {
            const { studentId, passwd } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !passwd) {
                return res.status(400).json({ r: 'err', info: '학번과 암호가 필요합니다.' });
            }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId, passwd });
            
            // 사용자가 이미 존재하는 경우
            if (existingUser) {
                return res.json({ r: 'ok', info: '코인을 반환합니다.', coin: existingUser.coin });
            }
            else {
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });

    router.route('/get_user_record').get(async (req, res) => {

        try {
            const { studentId, passwd } = req.query;

            // 학번과 이름이 제공되지 않은 경우 오류 응답
            if (!studentId || !passwd) {
                return res.status(400).json({ r: 'err', info: '학번과 암호가 필요합니다.' });
            }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId, passwd });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {

                // 사용자가 이미 존재하는 경우
                const records = await dataBase.collection(collectionName).find({ type: 'hl_record', id: studentId }).toArray();

                // 사용자가 이미 존재하는 경우
                if (records) {
                    
                    //record_time 기준으로 오름 차순으로 정렬
                    records.sort((a, b) => parseInt(a.record_time) - parseInt(b.record_time));

                    //3개만 반환
                    records.splice(3);

                    return res.json({ r: 'ok', info: '사용자 기록입니다.', records });
                }
                else {
                    return res.status(409).json({ r: 'err', info: '등록된 기록이 없습니다.' });
                }

            }
            else {
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }


    });


    router.use('/admin', (req, res, next) => {
        const admin_token = req.header('admin-token')
        if (admin_token != process.env.ADMIN_TOKEN) {
            return res.status(400).json({ r: 'err', info: '권한이 없습니다.' });
        }
        console.log('check admin auth from ip : ', req.ip)
        next()
    });


    //studentId 별로 사용자 리스트 얻기
    router.route('/admin/get_students_list').get(async (req, res) => {

        try {

            // const admin_token = req.header('admin-token')

            // if (admin_token != process.env.ADMIN_TOKEN) {
            //     return res.status(400).json({ r: 'err', info: '권한이 없습니다.' });
            // }

            const {classId } = req.query;

            // if (userId != 'admin_hlgame') {
            //     return res.status(400).json({ r: 'err', info: '권한이 없습니다.' });
            // }

            // 사용자 검색
            // const existingUser = await dataBase.collection(collectionName).find({}).toArray();


            let _query = { type: { $ne: 'hl_record' } };

            if (classId) {
                _query.classId = classId;
            }

            // 사용자 검색
            const existingUsers = await dataBase.collection(collectionName).find(_query, {
                projection: { _id: 1, name: 1, studentId: 1, registeredAt: 1, classId: 1, coin: 1 }
            }).toArray();


            // 사용자가 이미 존재하는 경우
            if (existingUsers) {
                return res.json({ r: 'ok', info: '사용자 리스트입니다.', list: existingUsers });
            }
            else {
                return res.status(409).json({ r: 'err', info: '등록된 사용자가 없습니다.' });
            }

        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });

    //coin 추가
    router.route('/admin/add_coin').post(async (req, res) => {

        try {
            const { studentId, coin, passwd } = req.body;

            // // 학번과 이름이 제공되지 않은 경우 오류 응답
            // if (!studentId || !passwd || !coin) {
            //     return res.status(400).json({ r: 'err', info: '학번과 암호, coin 가 필요합니다.' });
            // }

            // if (userId != 'admin_hlgame') {
            //     return res.status(400).json({ r: 'err', info: '권한이 없습니다.' });
            // }

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ studentId });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {

                //coin 추가
                await dataBase.collection(collectionName).updateOne({ studentId, passwd }, { $set: { coin: parseInt(existingUser.coin) + parseInt(coin) } });

                // 성공 응답
                res.json({ r: 'ok', info: '코인이 추가되었습니다.' });

            }
            else {
                return res.status(409).json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }


        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });

    
    router.route('/admin/delete_user').post(async (req, res) => {

        const { _id } = req.body

        console.log(req.body)
        console.log(_id)

        try {

            // _id를 ObjectId로 변환
            const objectId = new ObjectId(_id);



            console.log(_id, objectId)

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ _id: objectId });

            // 사용자 검색
            // const existingUser = await dataBase.collection(collectionName).findOne({ _id });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {
                await dataBase.collection(collectionName).deleteOne({ _id: objectId });
                return res.json({ r: 'ok', info: '사용자 삭제 성공' });
            }
            else {
                return res.json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }


        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }


    });

    //type : hl_record 인 로그 반환
    router.route('/admin/get_hl_record').get(async (req, res) => {
        try {
            const { classId, all } = req.query;
    
            if (all === 'true') {
                // 모든 hl_record 검색
                const recors_list = await dataBase.collection(collectionName).find({ type: 'hl_record' }).toArray();
    
                recors_list.sort((a, b) => parseInt(a.record_time) - parseInt(b.record_time));
    
                // 결과 반환
                res.json({ r: 'ok', list: recors_list });
            } else {
                // classId에 해당하는 모든 hl_record 검색
                const recors_list = await dataBase.collection(collectionName).find({ type: 'hl_record', classId: classId }).toArray();
    
                // studentId별로 가장 작은 record_time 선택
                const uniqueRecordsList = recors_list.reduce((map, record) => {
                    const existingRecord = map.get(record.id);
                    if (!existingRecord || parseInt(record.record_time) < parseInt(existingRecord.record_time)) {
                        map.set(record.id, record); // 더 작은 값을 가진 기록으로 업데이트
                    }
                    return map;
                }, new Map());
    
                // Map을 배열로 변환하고 소팅
                const sortedRecords = Array.from(uniqueRecordsList.values()).sort(
                    (a, b) => parseInt(a.record_time) - parseInt(b.record_time)
                );
    
                // 결과 반환
                res.json({ r: 'ok', list: sortedRecords });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });
    
                  
    router.route('/admin/delete_hl_record_clear').get(async (req, res) => {
        const { classId } = req.query; // 삭제할 조건으로 classId를 받음
    
        try {
            // hl_record 데이터 삭제
            const deleteResult = await dataBase.collection(collectionName).deleteMany({ type: 'hl_record', classId: classId });
    
            // 삭제 결과 반환
            res.json({
                r: 'ok',
                deletedCount: deleteResult.deletedCount // 삭제된 문서의 개수 반환
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                r: 'err',
                info: '서버 오류'
            });
        }
    });

    //collection clear
    router.route('/admin/clear').get(async (req, res) => {
        try {

            await dataBase.collection(collectionName).deleteMany({});

            res.json({ r: 'ok', info: 'collection cleared' });



        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }
    });

    router.route('/admin/get_detail').get(async (req, res) => {
        const { _id } = req.query

        try {
            // _id를 ObjectId로 변환
            const objectId = new ObjectId(_id);

            // 사용자 검색
            const existingUser = await dataBase.collection(collectionName).findOne({ _id: objectId });

            // 사용자가 이미 존재하는 경우
            if (existingUser) {
                return res.json({ r: 'ok', info: '사용자 정보입니다.', detail: existingUser });
            }
            else {
                return res.json({ r: 'err', info: '등록되지 않은 사용자입니다.' });
            }


        } catch (error) {
            console.error(error);
            res.status(500).json({ r: 'err', info: '서버 오류' });
        }


    });


    return router;

}




