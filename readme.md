# redSkeleton
익스프레이스를 쓰지않고 가볍게 만든 api 개발 프레임워크 입니다.  
외부 모듈은 yaml,node-static 만 사용하였습니다.  

## 사용법
반드시 클로닝 이후에 npm install을 한번 실행해주세요.  
index.js 가 메인 모듈입니다. 실행은 아래예와 같이 합니다.  

```sh
npm install # 처음 한번만
node index.js
```

## 설정파일  
처음에 setting.yaml 파일이 자동으로 생성됩니다.  
* port 는 서비스 포트 번호입니다.  
* upload_path 업로드 api 가 파일을 저장할 위치를 지정합니다.  
* web_content_path html 파일과 같은 정적웹파일들이 있을 곳을 지정합니다.  
* 테스트 페이지를 보려면 web_content_path : ./web_sample 로 수정  

## todo

* 웹에서 디랙토리와 파일목록을 구분해서 출력  
* 웹에서 파일읽기,쓰기 지우기 예제  






