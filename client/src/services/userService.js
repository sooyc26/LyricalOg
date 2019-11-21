import axios from 'axios';

function login(data){
    const url= 'http://localhost:49694/api/users/login'

    const config={
        method:'POST',
        data:data,
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function create(data) {
    const url= 'http://localhost:49694/api/users'
    
    const config={
        method:'POST',
        data:data,
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}
function validationRequest(id) {
    const url= 'http://localhost:49694/api/users/validate/'+id
    
    const config={
        method:'GET',
        //data:data,
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getAll() {
    const url= 'http://localhost:49694/api/users'
    
    const config={
        method:'GET',
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getById(id) {
    const url = 'http://localhost:49694/api/users/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}

function getUserProfile(id) {
    const url = 'http://localhost:49694/api/userProfile/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}

function update(id, data) {
    const url= 'http://localhost:49694/api/users/'+id
    const config={
        method:'PUT',
        data:data
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function deleteById(id) {
    const url= 'http://localhost:49694/api/users/'+id
    
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
export {create, getAll,validationRequest, getById,update,deleteById,login,getUserProfile}
  
