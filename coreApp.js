
import http from "http";
import fs from "fs";
import { writeFile } from 'fs/promises';
import net from 'net'
// import UrlParser from "url"
import { URL } from 'url';
import nodeStatic from "node-static"

class CCoreApp {
  static version = '1.0.0';

  constructor({ port, upload_path, web_content_path }) {

    this.port = port;
    this.web_content_path = web_content_path;
    this.upload_path = upload_path;


    //폴더가 없으면 만들기 
    //upload path
    if (!fs.existsSync(this.upload_path)) {
      fs.mkdirSync(this.upload_path);
      console.log(`create ${this.upload_path}`);
    }
    else {
      console.log(`check ${this.upload_path}`)
    }

    //web contents path
    if (!fs.existsSync(this.web_content_path)) {
      fs.mkdirSync(this.web_content_path);
      console.log(`create ${this.web_content_path}`);
    }
    else {
      console.log(`check  ${this.web_content_path}`);
    }



    var fileServer = new (nodeStatic.Server)(this.web_content_path);

    this.httpServer = http.createServer(
      async (req, res) => {

        if (req.url.indexOf('/rest/') == 0) {
          try {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(`remote address (${ip})`);
          }
          catch (e) {
            console.log(e);
          }

          var method = req.method;
          if (method == 'OPTIONS') { //post 처리 
            method = req.headers['access-control-request-method'];
          }
          else {
          }

          // console.log(method);

          switch (method) {
            case 'GET':
              // console.log(this.repos_path);
              this.process_get(req, res)
              break;
            case 'POST':
              // console.log(this.repos_path);
              // (process_post.bind(this))(req, res);
              this.process_post(req, res);
              break;
          }
        }
        else {
          //정적웹 서비스 
          // console.log('static web ' )
          fileServer.serve(req, res);
        }
      }
    );

    //start http server
    this.httpServer.listen(this.port);

    console.log(`daisy version : ${CCoreApp.version}  web port : ${this.port}  , web path : ${this.web_content_path}`);

  }

  /////////////////
  //get
  async process_get(req, res) {

    // var result = UrlParser.parse(req.url, true);
    // const _query = result.query

    let urlObj = new URL(
      req.url, // url이 상대적인 경로일경우(path만존재) 두번째 인자인 base url을 꼭 지정해주어야한다.
      'http://example.org/' //base url (The base URL to resolve against if the input is not absolute.)
    )


    let header = {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Max-Age': '1000',
      "Access-Control-Allow-Headers": "*" //CORS 정책 허용  * 는 모두 허용 
    }
    let _data = ""

    try {

      let _rest_path = urlObj.pathname.substring(5)
      console.log(_rest_path)

      switch (_rest_path) {
        case '/get/filelist':
          let _cwd = urlObj.searchParams.get('cwd')
          let _files = []
          fs.readdirSync(_cwd).forEach(file => {
            console.log(file);
            _files.push(file)
          });
          _data = JSON.stringify({ r: "ok", files: _files })
          // res.end()
          break;
        default:
          _data = JSON.stringify({ r: "ok", msg: `daisy system ${CCoreApp.version}` })
          break;
      }
    }
    catch (err) {
      _data = JSON.stringify({ r: "ok", err: err.toString() })

    }
    res.writeHead(200, header);
    res.end(_data)
  }

  //post
  async process_post(req, res) {

    let urlObj = new URL(
      req.url, // url이 상대적인 경로일경우(path만존재) 두번째 인자인 base url을 꼭 지정해주어야한다.
      'http://example.org/' //base url (The base URL to resolve against if the input is not absolute.)
    )
    let body_data = []
    // console.log(this)
    // 앞부분 rest/ 빼기
    let _rest_path = urlObj.pathname.substring(5)

    switch (_rest_path) {
      case '/post/writeFile':
        {
          // let uploadName = req.headers['upload-name']
          console.log(req.headers)

          //포스트는 데이터가 조각조각 들어 온다.
          req.on('data', (data) => {
            //body_data += data;
            body_data.push(data)
            console.log(`${data.length}  bytes saved `);
          });

          req.on('end', async () => {
            //다받고 나면
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Max-Age': '1000',
              "Access-Control-Allow-Headers": "write-Name,write-Directory" //CORS 정책 허용  * 는 모두 허용 ,대소문자 구문없이 무조건 소문자
            });

            let _name = req.headers['write-name']
            let _cwd = req.headers['write-directory']
            let _data = Buffer.concat(body_data)

            await writeFile(`${_cwd}/${_name}`, _data);

            let result = { result: 'ok', body: _data.toString() }
            res.end(JSON.stringify(result));

          });
        }
        break;
      case '/post/upload':
        {
          let uploadName = req.headers['upload-name']
          //만약 cORS보안상의 이유로 upload-name같은 커스텀 해더읽기 실패한다면 Access-Control-Allow-Headers 옵션을 주어 응답하면 해당 옵션에 반응하여 재요청 들어온다.
          if (!uploadName) {
            //CORS 관련 처리 , 
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Max-Age': '1000',
              "Access-Control-Allow-Headers": "upload-name ,content-type ,file-size"
              // "Access-Control-Allow-Headers": "*" //CORS 정책 허용  * 는 모두 허용 
            });

            console.log('try custom header')
            res.end();

          }
          else {
            res.writeHead(200, {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Max-Age': '1000'
            });

            try {

              let _path = this.upload_path

              //없으면 만들기 
              if (!fs.existsSync(_path)) {
                // Do something
                console.log(`${_path} not exists and create it`)
                fs.mkdirSync(_path);
              }

              let file_size = parseInt(req.headers['file-size'])

              let filepath = `${_path}/${uploadName}`;
              console.log(`start write file path : ${filepath}, file size :${file_size}`);

              //파일 오픈 
              let fd = fs.openSync(filepath, "w");
              let _index = 0;

              //포스트는 데이터가 조각조각 들어 온다.
              req.on('data', (data) => {
                _index += data.length;
                console.log(`data receive : ${data.length} , ${_index}`);
                fs.writeSync(fd, data);
              });

              req.on('end', () => {
                console.log(`data receive end : ${_index}`);
                fs.closeSync(fd);
                let result = { result: 'ok', fn: filepath }
                res.end(JSON.stringify(result));

              })
            }
            catch (e) {
              console.log(e)
              let result = { result: 'err', err: e }
              res.end(JSON.stringify(result));
            }
          }
        }
        break;
      default:
        res.end(JSON.stringify({ r: "ok", msg: `daisy system ${CCoreApp.version}` }))
        break;

    }
  }

}
export { CCoreApp }