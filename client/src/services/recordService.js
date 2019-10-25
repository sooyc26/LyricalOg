import axios from 'axios'

function create(data) {
    const url = 'http://localhost:49694/api/record'

    const config = {
        method: 'POST',
        data: data,

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function uploadFile(responseData, uploadFile) {
    const s3UploadURL = responseData.SignedUrl;
    
    const header = {
        headers: {
            'Content-Type': uploadFile.type, 
            //'x-amz-acl': 'public-read'
        }
    }

    const promise = axios.put(s3UploadURL, uploadFile, header)
        .then(response => {
            console.log(response);
            return response
        })
        .catch(responseError);

    return promise;
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
export { create, uploadFile }