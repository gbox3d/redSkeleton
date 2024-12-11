# redSkeleton (Express) , Challenge mode

## npm 모듈 새로 설치하기

```sh
npm i @babel/cli @babel/core @babel/node @babel/preset-env dotenv express fs-extra
npm i -D cross-env nodemon
```

## 사용법
반드시 클로닝 이후에 npm install을 한번 실행해주세요.  
sample.config.env 를 config.en 로 바꿔주세요.


```sh
npm install # 처음 한번만
cp sample.config.env config.env

npm start # 배포용 실핼
npm run dev # 개발용 실행 

pm2 start npm --time --name "hl_game" -- start # pm2로 실행
```

## api auth 인증방법
auth 인증토큰을 헤더에 전달한다.  
```
auth-token : 5874  
```

## API 목록

---

### 사용자 등록
**Endpoint**  
`GET /api/v2/challenge/register`

**Query Parameters**  
- `studentId` (string, required): 학번  
- `name` (string, required): 이름  
- `passwd` (string, required): 암호  
- `classId` (string, optional): 반 ID  

**반환 형식**  
```json
{
  "r": "ok",
  "info": "사용자 등록 성공"
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "이미 등록된 사용자입니다."
}
```

---

### 코인 확인
**Endpoint**  
`GET /api/v2/challenge/get_coin`

**Query Parameters**  
- `studentId` (string, required): 학번  
- `passwd` (string, required): 암호  

**반환 형식**  
```json
{
  "r": "ok",
  "info": "코인을 반환합니다.",
  "coin": 10
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "등록되지 않은 사용자입니다."
}
```

---

### 기록 확인


**Endpoint**  
`GET /api/v2/challenge/get_user_record`

**Query Parameters**  
- `studentId` (string, required): 학번  
- `passwd` (string, required): 암호  

**반환 형식**  
```json
{
  "r": "ok",
  "info": "사용자 기록입니다.",
  "records": [
    {
      "type": "hl_record",
      "id": "12345678",
      "classId": "101",
      "name": "홍길동",
      "record_time": 5000
    }
  ]
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "등록된 기록이 없습니다."
}
```

**주의사항**  
상위기록 3개만 가져온다.  
---


### 게임 시작 (비밀 번호 생성)
**Endpoint**  
`GET /api/v2/challenge/start_hl`

**Query Parameters**  
- `studentId` (string, required): 학번  
- `passwd` (string, required): 암호  

**반환 형식**  
```json
{
  "r": "ok",
  "info": "비밀의 숫자를 생성했습니다."
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "코인이 부족합니다."
}
```

---

### 숫자 맞히기
**Endpoint**  
`GET /api/v2/challenge/find_hl`

**Query Parameters**  
- `studentId` (string, required): 학번  
- `passwd` (string, required): 암호  
- `num` (integer, required): 사용자가 입력한 숫자  

**반환 형식**  
```json
{
  "r": "ok",
  "info": "정답입니다.",
  "dir": 0
}
```

오답 시:  
```json
{
  "r": "ok",
  "info": "정답보다 작습니다.",
  "dir": 1
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "등록되지 않은 사용자입니다."
}
```

---

### 관리자 - 사용자 리스트 조회
**Endpoint**  
`GET /api/v2/challenge/admin/get_students_list`

**Query Parameters**  
- `classId` (string, optional): 특정 반의 사용자 리스트 조회  

**반환 형식**  
```json
{
  "r": "ok",
  "info": "사용자 리스트입니다.",
  "list": [
    {
      "_id": "63f1ab6e8e4f7d8e3b2f9c9c",
      "name": "홍길동",
      "studentId": "12345678",
      "registeredAt": "2024-12-01T10:00:00.000Z",
      "classId": "101",
      "coin": 5
    }
  ]
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "등록된 사용자가 없습니다."
}
```

---

### 관리자 - 사용자 삭제
**Endpoint**  
`POST /api/v2/challenge/admin/delete_user`

**Request Body**  
```json
{
  "_id": "63f1ab6e8e4f7d8e3b2f9c9c"
}
```

**반환 형식**  
```json
{
  "r": "ok",
  "info": "사용자 삭제 성공"
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "등록되지 않은 사용자입니다."
}
```

---

### 관리자 - 코인 추가
**Endpoint**  
`POST /api/v2/challenge/admin/add_coin`

**Request Body**  
```json
{
  "studentId": "12345678",
  "coin": 5
}
```

**반환 형식**  
```json
{
  "r": "ok",
  "info": "코인이 추가되었습니다."
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "등록되지 않은 사용자입니다."
}
```

---

### 관리자 - 기록 삭제
**Endpoint**  
`GET /api/v2/challenge/admin/delete_hl_record_clear`

**Query Parameters**  
- `classId` (string, required): 삭제할 반 ID  

**반환 형식**  
```json
{
  "r": "ok",
  "deletedCount": 10
}
```

에러 발생 시:  
```json
{
  "r": "err",
  "info": "서버 오류"
}
