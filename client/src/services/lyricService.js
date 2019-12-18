import axios from 'axios';

function create(data) {
    const url= 'http://localhost:49694/lyrics'
    
    const config={
        method:'POST',
        data:data,
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}


function uploadFile(responseData, uploadFile) {

    const s3UploadURL = responseData.SignedUrl;

    const header = {
        headers: {
            'Content-Type': uploadFile.type
        }
    }
    debugger
    const promise = axios.put(s3UploadURL, uploadFile, header)
        .then(response => {
            console.log(response);
            return response
        })
        .catch(responseError);

    return promise;
}

function getAll() {
    const url= 'http://localhost:49694/lyrics'
    
    const config={
        method:'GET',
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getById(id) {
    const url = 'http://localhost:49694/lyrics/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}
function getByBeatId(id) {
    const url = 'http://localhost:49694/lyrics/beat/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}
function update(id, data) {
    const url= 'http://localhost:49694/lyrics/'+id
    const config={
        method:'PUT',
        data:data
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function vote(data) {
    const url= 'http://localhost:49694/lyrics/vote/'
    
    const config={
        method:'POST',
        data:data,
    }

    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function deleteByVoteId(data) {
    const url= 'http://localhost:49694/lyrics/vote/'
    
    const config={
        method:'Delete',
        data:data
    }

    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function deleteById(id) {
    const url= 'http://localhost:49694/lyrics/'+id
    
    const config={
        method:'DELETE',
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

const responseSuccess = response => {
    console.log(response);
    return response.data
}

const responseError = error => {
    if (error && error.response && error.response.data && error.response.data.errors) {
        console.log(error.response.data.errors)
    } else {
        console.log(error);
    }
    return Promise.reject(error);
}
export {create, getAll,vote,getByBeatId, getById,update,uploadFile,deleteById,deleteByVoteId}