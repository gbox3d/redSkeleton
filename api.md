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
