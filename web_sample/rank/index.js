let admin_token = null;


export default async function main() {
    console.log("hello es6");

    const _recordRootElm = document.querySelector('#record');
    const inputAdminToken = _recordRootElm.querySelector('#admin-token');
    const inputClassId = _recordRootElm.querySelector('#class-id');

    async function _updateRank() {
        const _listElm = _recordRootElm.querySelector('ul');
        const _classId = inputClassId.value;

        //clear list
        while (_listElm.firstChild) {
            _listElm.removeChild(_listElm.firstChild);
        }

        const params = new URLSearchParams();
        // params.append('userId', 'admin_hlgame');
        params.append('classId', _classId);

        // REST API 호출
        const response = await fetch(`/api/v2/challenge/admin/get_hl_record?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/plain',
                'auth-token': 'DtqBzT4O',
                'admin-token': admin_token
            }

        });

        // 응답 결과 확인
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // JSON 데이터 파싱
        const data = await response.json();

        // // 결과를 콘솔에 출력
        console.log(data);

        if(data.r === 'ok'){
            
            const _rankList = data.list;

            let _rankNum = 1;

            for(const _rank of _rankList){
                const _li = document.createElement('li');
                _li.innerHTML = `${_rankNum} ${_rank.id} / ${_rank.name}, Score : ${_rank.record_time / 1000} sec`;
                _listElm.appendChild(_li);

                _rankNum++;
            }

        }
    }

    document.querySelector('#btn-update-token').addEventListener('click', function() {
        
        const admin_token = inputAdminToken.value;
        const _id = inputClassId.value;
        if(admin_token === ''){
            alert('admin token is required');
            return;
        }
        localStorage.setItem('admin_token', admin_token);
        localStorage.setItem('class_id', _id);
        
        //reload
        location.reload();

    });

    document.querySelector('#btn-remove-token').addEventListener('click', function() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('class_id')
        location.reload();
    });

    


    //admin token 처리
    if(localStorage.getItem('admin_token') === null){
        // admin_token = prompt('Enter admin token');
        if(admin_token === null){
            alert('admin token is required');
            return;
        }
        localStorage.setItem('admin_token', admin_token);

        //reload
        location.reload();
        
    }
    else {
        admin_token = localStorage.getItem('admin_token');
        console.log(admin_token);
        inputAdminToken.value = admin_token;
        // _userMng.querySelector('.admin-token').innerHTML = `Admin Token : ${admin_token}`;
    }

    if(localStorage.getItem('class_id') !== null){
        const class_id = localStorage.getItem('class_id');

        // _recordRootElm.querySelector('.input-class-id').value = class_id;
        inputClassId.value = class_id;
    }
    else {
        // const _id = prompt('Enter class id');
        if(_id === null){
            alert('class id is required');
            return;
        }
        localStorage.setItem('class_id', _id);

    }

    function _loop() {

        _updateRank();

        console.log('update rank');

        setTimeout(_loop, 15000);
    }

    _loop();
    

    // _updateRank();

}