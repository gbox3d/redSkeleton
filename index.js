import YAML from 'yaml'
import fs from 'fs'
import { CCoreApp } from './coreApp.js';

let settings = {
    port: 8080,
    upload_path: './uploads',
    web_content_path: './web_content',
}
if (!fs.existsSync('settings.yaml')) {
    console.log('create settings.yaml')
    fs.writeFileSync('settings.yaml',YAML.stringify(settings))
}
else {
    settings = YAML.parse(fs.readFileSync('settings.yaml','utf-8'))
}


let app = new CCoreApp({
    port: settings.port,
    upload_path: settings.upload_path,
    web_content_path: settings.web_content_path
});
