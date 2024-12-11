let admin_token;

export default async function main() {
    console.log("hello es6");

    

    document.querySelector('#intro .btn-check').addEventListener('click', async function () {
        try {

            // REST API 호출
            const response = await fetch('/api/v2/challenge', {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain',
                    'auth-token': 'DtqBzT4O'
                }
            });

            // 응답 결과 확인
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // JSON 데이터 파싱
            const data = await response.json();

            // 결과를 콘솔에 출력
            console.log(data);

            // 페이지에 결과 표시
            document.querySelector('#intro .text-msg').textContent = `Response: ${data.r}, Info: ${data.info}`;
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });

    document.querySelector('#register .submit').addEventListener('click', async function (event) {
        event.preventDefault();
        try {

            let _form = document.querySelector('#register form');
            // // const name = document.getElementById('name').value;
            // // const studentId = document.getElementById('student_id').value;
            // // const passwd = document.getElementById('passwd').value;

            // const name = _form.name.value;
            // const studentId = _form.student_id.value;
            // const passwd = _form.passwd.value;
            // const classId = '2024_01';

            const params = new URLSearchParams();
            params.append('name', _form.name.value);
            params.append('studentId', _form.student_id.value);
            params.append('passwd', _form.passwd.value);
            params.append('classId', '2024_01');

            // REST API 호출
            const response = await fetch(`/api/v2/challenge/register?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain',
                    'auth-token': 'DtqBzT4O'
                }
            });

            // 응답 결과 확인
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // JSON 데이터 파싱
            const data = await response.json();

            // 결과를 콘솔에 출력
            console.log(data);

            // 페이지에 결과 표시
            document.getElementById('text-result').textContent = `Response: ${data.r}, Info: ${data.info}`;
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });


    document.querySelector('.btn-start').addEventListener('click', async function () {
        try {
            // let _form = document.querySelector('#start_hl form');
            let _form = document.querySelector('#register form');
            // const studentId = document.getElementById('student_id').value;
            // const passwd = document.getElementById('passwd').value;

            const studentId = _form.student_id.value;
            const passwd = _form.passwd.value;

            // REST API 호출
            const response = await fetch(`/api/v2/challenge/start_hl?studentId=${encodeURIComponent(studentId)}&passwd=${encodeURIComponent(passwd)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain',
                    'auth-token': 'DtqBzT4O'
                }
            });

            // 응답 결과 확인
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // JSON 데이터 파싱
            const data = await response.json();

            // 결과를 콘솔에 출력
            console.log(data);

            // 페이지에 결과 표시
            document.getElementById('text-result').textContent = `Response: ${data.r}, Info: ${data.info}`;
        } catch (error) {
            // console.error('Fetch error:',
        }
    });

    document.querySelector('#game .btn-answer').addEventListener('click', async function () {

        const _answer = document.querySelector('#game .input-answer').value;


        console.log(_answer);

        let _form = document.querySelector('#register form');
        const studentId = _form.student_id.value;
        const passwd = _form.passwd.value;

        const params = new URLSearchParams();
        params.append('studentId', studentId);
        params.append('passwd', passwd);
        params.append('num', _answer);

        try {
            //rest api 호출
            const response = await fetch(`/api/v2/challenge/find_hl?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'text/plain',
                    'auth-token': 'DtqBzT4O'
                }
            });

            // 응답 결과 확인
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // JSON 데이터 파싱
            const data = await response.json();

            // 결과를 콘솔에 출력
            console.log(data);
        }
        catch (error) {
            console.error('Fetch error:', error);
        }

    });

    const _userMng = document.querySelector('#userMng');

    //admin token 처리
    if(localStorage.getItem('admin_token') === null){
        admin_token = prompt('Enter admin token');
        if(admin_token === null){
            alert('admin token is required');
            return;
        }
        localStorage.setItem('admin_token', admin_token);
    }
    else{
        admin_token = localStorage.getItem('admin_token');
        console.log(admin_token);
        _userMng.querySelector('.admin-token').innerHTML = `Admin Token : ${admin_token}`;
    }

    userMng.querySelector('.remove-admin-token').addEventListener('click', function() {
        localStorage.removeItem('admin_token');
        
        //reload
        location.reload();

    });


    async function _updateList(_classId) {
        try {

            const _list = _userMng.querySelector('#userMng ul');

            //clear list
            let _child = _list.lastElementChild;
            while (_child) {
                _list.removeChild(_child);
                _child = _list.lastElementChild;
            }



            const params = new URLSearchParams();
            params.append('userId', 'admin_hlgame');
            params.append('classId', _classId);


            // REST API 호출
            const response = await fetch(`/api/v2/challenge/admin/get_students_list?${params.toString()}`, {
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

            console.log(data);

            // 리스트 추가
            if (data.r === 'ok' && Array.isArray(data.list)) {
                data.list.forEach(user => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `ID: ${user.studentId}, Name: ${user.name}, Registered At: ${user.registeredAt} coin : ${user.coin}`;
                    listItem.setAttribute('data-id', user._id);
                    _list.appendChild(listItem);
                });
            } else {
                document.getElementById('text-result').textContent = `Error: ${data.info}`;
            }




        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    document.querySelector('#userMng button.getlist').addEventListener('click', async function (evt) {

        const _classId = _userMng.querySelector('.input-classId').value;

        try {
            document.getElementById('text-result').textContent = `Get list for class ${_classId}`;
            evt.target.disabled = true;

            await _updateList(_classId);

            document.getElementById('text-result').textContent = `Get list for class ${_classId} done`;


        }
        catch (error) {
            console.error('Fetch error:', error);
        }


        evt.target.disabled = false;


    });

    _userMng.querySelector('button.addcoin').addEventListener('click', async function () {


        let _form = document.querySelector('#register form');

        const userId = 'admin_hlgame';
        const coin = _userMng.querySelector('.input-coin').value;
        const studentId = _form.student_id.value;
        const passwd = _form.passwd.value;

        try {
            const response = await fetch(`/api/v2/challenge/admin/add_coin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': 'DtqBzT4O',
                    'admin-token': admin_token
                },
                body: JSON.stringify({
                    userId: userId,
                    studentId: studentId,
                    coin: coin,
                    passwd: passwd
                })
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);

        }
        catch (error) {
            console.error('Fetch error:', error);
        }





    });

    _userMng.querySelector('ul').addEventListener('click', async function (event) {
        if (event.target.tagName === 'LI') {
            const userId = event.target.getAttribute('data-id');
            console.log(userId);
            event.target.classList.toggle('selected');


            //get user info

            const response = await fetch(`/api/v2/challenge/admin/get_detail?_id=${encodeURIComponent(userId)}`, {
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

            // 결과를 콘솔에 출력
            console.log(data);


            let _form = document.querySelector('#register form');

            _form.name.value = data.detail.name;
            _form.student_id.value = data.detail.studentId;
            _form.passwd.value = data.detail.passwd;


        }
    });

    _userMng.querySelector('button.delete').addEventListener('click', async function () {

        const _selected = _userMng.querySelectorAll('ul li.selected');

        if (_selected.length === 0) {
            document.getElementById('text-result').textContent = 'No user selected';
            return;
        }

        const userIds = Array.from(_selected).map(item => item.getAttribute('data-id'));

        if (!confirm(`Delete ${userIds.length} user(s)?`)) {
            return;
        }

        try {

            this.disabled = true;

            for (let item of _selected) {
                // _selected.forEach(async item => {
                console.log(item.getAttribute('data-id'));
                const studentId = item.getAttribute('data-id');

                // const params = new URLSearchParams();
                // params.append('_id', studentId);

                // REST API 호출
                const response = await fetch(`/api/v2/challenge/admin/delete_user`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': 'DtqBzT4O',
                        'admin-token': admin_token
                    },
                    body: JSON.stringify({
                        _id: studentId
                    })
                });

                // 응답 결과 확인
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // JSON 데이터 파싱
                const data = await response.json();

                console.log(data);

                // });
            }

            this.disabled = false;

            const _classId = _userMng.querySelector('.input-classId').value;
            _updateList(_classId);

        } catch (error) {
            console.error('Fetch error:', error);
        }

    });

    document.querySelector('#result .btn-result').addEventListener('click', async function () {
        try {


            const _classId = _userMng.querySelector('.input-classId').value;

            // REST API 호출
            const response = await fetch(`/api/v2/challenge/admin/get_hl_record?classId=${_classId}`, {
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

            // 결과를 콘솔에 출력
            console.log(data);

            const _record_list = document.querySelector('#result ul');

            //clear list
            let _child = _record_list.lastElementChild;
            while (_child) {
                _record_list.removeChild(_child);
                _child = _record_list.lastElementChild;
            }

            // 리스트 추가
            if (data.r === 'ok' && Array.isArray(data.list)) {
                data.list.forEach(record => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `classId : ${record.classId} ID: ${record.id}, Name: ${record.name}, record_time: ${record.record_time}`;
                    _record_list.appendChild(listItem);
                });
            } else {
                document.getElementById('text-result').textContent = `Error: ${data.info}`;
            }

            // 페이지에 결과 표시
            // document.querySelector('#result .text-msg').textContent = `Response: ${data.r}, Info: ${data.info}`;
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });

    document.querySelector('#result .btn-reset').addEventListener('click', async function () {
        try {

            const _classId = _userMng.querySelector('.input-classId').value;

            const params = new URLSearchParams();
            // params.append('userId', 'admin_hlgame');
            params.append('classId', _classId);



            // REST API 호출
            const response = await fetch(`/api/v2/challenge/admin/delete_hl_record_clear?${params.toString()}`, {
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

            // 결과를 콘솔에 출력
            console.log(data);

            // 페이지에 결과 표시
            document.querySelector('#result .text-msg').textContent = `delete count : ${data.deleteCount}`;
        } catch (error) {
            console.error('Fetch error:', error);
        }
    });

}