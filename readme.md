# redSkeleton
익스프레이스를 쓰지않고 가볍게 만든 api 개발 프레임워크 입니다.  
외부 모듈은 yaml,node-static 만 사용하였습니다.  

sh```
npm i yaml node-static
npm i -D nodemon cross-env # 개발환경 
```
## 사용법
반드시 클로닝 이후에 npm install을 한번 실행해주세요.  
index.js 가 메인 모듈입니다. 실행은 아래예와 같이 합니다.  

```sh
npm install # 처음 한번만
npm start
```

## 설정파일  
config.env 파일로 이름변경
```
mv config.env.sample config.env
```
## todo

* 웹에서 디랙토리와 파일목록을 구분해서 출력  
* 웹에서 파일읽기,쓰기 지우기 예제  

## 브랜치

express : express 기반으로 로 만든 버전  
dev : master 브랜치의 개발버전  






