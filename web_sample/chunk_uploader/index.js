
const fileInput = document.getElementById('file-input');
const progressBar = document.getElementById('progress-bar');
const info_text = document.getElementById('info-text');

const apiUrl = '/api/v1/uploader/chunk';
const fc_apiUrl = '/api/v1/fc';
const base_path = './uploads';

const fileList = document.getElementById('file-list');

const myVideo = document.getElementById('myVideo');
const videoSource = myVideo.querySelector('source');

async function uploadFileInChunks(file, chunkSize = 1024 * 1024) {
    const totalSize = file.size;
    let uploadedBytes = 0;

    for (let start = 0; start < totalSize; start += chunkSize) {
        const chunk = file.slice(start, start + chunkSize);

        // fetch: 한 조각씩 업로드
        const res = await fetch(apiUrl, {
            method: 'POST',
            body: chunk,
            headers: {
                'Content-Type': 'application/octet-stream',  // 또는 file.type
                'upload-name': encodeURIComponent(file.name),
                'file-size': totalSize,
                'chunk-start': start,
                'chunk-size': chunk.size,
                'auth-token': '5874'
            },
        });

        const json = await res.json();
        console.log(json);

        uploadedBytes = start + chunk.size;
        const progress = Math.round((uploadedBytes / totalSize) * 100);
        progressBar.value = progress;
    }
}

async function updateFileList(cwd) {
    try {

        info_text.innerHTML = `Fetching file list from ${cwd}...`;

        // cwd를 쿼리 파라미터로 인코딩하여 URL에 붙임
        const url = `${fc_apiUrl}/filelist?cwd=${encodeURIComponent(cwd)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'auth-token': '5874',
            },
        });

        const data = await response.json();
        // 예: { r: "ok", files: ["file1.txt", "file2.jpg", ...] }

        // 파일 리스트 영역 초기화
        fileList.innerHTML = '';

        // 파일 목록을 순회하며 <li> 항목으로 추가
        if (data.files && Array.isArray(data.files)) {
            data.files.forEach(filename => {
                const li = document.createElement('li');
                li.textContent = filename;
                fileList.appendChild(li);
            });
        }

        info_text.innerHTML = `File list fetched from ${cwd}`;
    } catch (err) {
        console.error('Error fetching file list:', err);
    }
}

async function main() {

    document.getElementById('upload-btn').onclick = async () => {
        const fileList = fileInput.files;
        if (!fileList.length) return; // 파일을 선택하지 않았다면 종료

        try {

            // 여러 파일을 순차적으로 업로드
            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];
                console.log(`Start uploading file: ${file.name}`);

                info_text.innerHTML = `Uploading ${file.name}...`;

                // 각 파일마다 progressBar를 0으로 초기화F
                progressBar.value = 0;

                // 조각 업로드
                await uploadFileInChunks(file, 1 * 1024 * 1024); // 예: 1MB씩 업로드

                // info_text.innerHTML = `File #${i + 1}/${fileList.length} (${file.name}) Upload Completed!`;

                // alert(`File #${i + 1}/${fileList.length} (${file.name}) Upload Completed!`);
            }

            // alert('All selected files have been uploaded!');
            info_text.innerHTML = 'All selected files have been uploaded!';

            // 파일 업로드 후 파일 목록을 업데이트
            updateFileList(base_path);

        } catch (err) {
            console.error(err);
            alert('An error occurred during upload');
        }
    };

    document.querySelector('#btn-delete').addEventListener('click', async () => {

        const selectedFiles = Array.from(fileList.querySelectorAll('.selected')).map(li => li.textContent);

        // 파일이 선택되지 않았다면 중단
        if (!selectedFiles.length) {
            alert('No files selected!');
            return;
        }

        for (const filename of selectedFiles) {
            try {
                const bodyData = {
                    path: base_path,     // 실제 삭제할 폴더 경로
                    file: filename  // 삭제할 파일 이름
                };

                const response = await fetch(`${fc_apiUrl}/delete`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': '5874',       // 필요하다면 추가
                    },
                    body: JSON.stringify(bodyData),
                });

                const result = await response.json();
                console.log('Delete API result:', result);

                if (result.r === 'ok') {
                    // UI에서 삭제한 항목을 제거하거나, fileList를 새로고침할 수 있습니다.
                    // (여기서는 단순히 li요소를 DOM에서 제거하는 예시)
                    const liToRemove = Array.from(fileList.children)
                        .find(li => li.textContent === filename);
                    if (liToRemove) liToRemove.remove();

                    info_text.innerHTML = `File ${filename} has been deleted`;

                } else {
                    // 서버에서 에러 반환 시
                    // alert(`Failed to delete: ${filename}\n${JSON.stringify(result)}`);
                    info_text.innerHTML = `Failed to delete: ${filename}\n${JSON.stringify(result)}`;
                }

            } catch (error) {
                console.error('Error while deleting file:', error);
                //   alert(`Error while deleting file: ${filename}\n${error}`);
                info_text.innerHTML = `Error while deleting file: ${filename}\n${error}`;
            }
        }

    });

    document.querySelector('#btn-download').addEventListener('click', async () => {
        const selectedFiles = Array.from(fileList.querySelectorAll('.selected')).map(li => li.textContent);

        // 파일이 선택되지 않았다면 중단
        if (!selectedFiles.length) {
            alert('No files selected!');
            return;
        }

        // 선택된 파일들 반복 처리
        for (const fileName of selectedFiles) {
            try {
                // 서버에 파일 다운로드 요청
                const response = await fetch(`${fc_apiUrl}/read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': '5874', // 필요시 추가
                    },
                    body: JSON.stringify({
                        path: base_path, // 실제 파일이 저장된 경로
                        file: fileName,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} : ${response.statusText}`);
                }

                // 2) Content-Length 추출 (파일 크기를 알 수 있다면)
                const contentLength = response.headers.get('Content-Length');
                if (!contentLength) {
                    console.warn('No Content-Length header, cannot compute download progress accurately.');
                }

                // 3) 스트리밍 읽기 준비
                const reader = response.body.getReader();
                const chunks = [];
                let receivedBytes = 0;

                // 4) <progress> 태그 참조
                const progressBar = document.getElementById('download-progress');
                progressBar.value = 0; // 초기화

                // 5) 스트리밍 루프
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // 다운로드가 끝났으면 루프 종료
                        break;
                    }
                    chunks.push(value);
                    receivedBytes += value.length;

                    // 6) 진행률 계산
                    if (contentLength) {
                        const percent = (receivedBytes / contentLength) * 100;
                        progressBar.value = Math.floor(percent);
                    } else {
                        // Content-Length가 없다면, 단순히 바이트 누적만 표시 가능
                        // progressBar.value = ... (상대적 진행 불가)
                    }
                }

                // 응답을 Blob으로 받아서 브라우저에 다운로드 트리거
                // const blob = await response.blob();
                const blob = new Blob(chunks);

                // Blob URL 생성
                const downloadUrl = window.URL.createObjectURL(blob);

                // <a> 태그를 동적으로 만들어 클릭 → 다운로드
                const tempLink = document.createElement('a');
                tempLink.href = downloadUrl;
                tempLink.download = fileName; // 저장될 때의 기본 파일명
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);

                // Blob URL 해제
                window.URL.revokeObjectURL(downloadUrl);

                console.log(`File download triggered: ${fileName}`);

            } catch (err) {
                console.error('Download error:', err);
                alert(`Error downloading file "${fileName}":\n${err}`);
            }
        }

    });

    fileList.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.tagName === 'LI') {
            
            // 기존 선택 초기화

            const selectedItems = fileList.querySelectorAll('.selected');
            selectedItems.forEach(item => item.classList.remove('selected'));


            // .selected 클래스 추가
            // target.classList.toggle('selected');
            target.classList.add('selected');

            // 파일명 추출
            const fileName = target.textContent.trim();

            // 동영상 재생 경로 설정
            // 예: /api/v1/getVideo?file=sample.mp4&path=./uploads
            const newSrc = `/uploads/${fileName}`;

            // <source> 엘리먼트 src 업데이트
            videoSource.src = newSrc;

            // <video> 엘리먼트가 새 소스를 인식하도록 load() 호출
            myVideo.load();

            // 자동 재생을 원한다면 play() 호출
            myVideo.play().catch(err => {
                // 자동 재생이 차단될 수 있으므로, 필요하면 예외 처리
                console.log('Autoplay was prevented:', err);
            });
        }
    });

    updateFileList(base_path);

}

export default main;
