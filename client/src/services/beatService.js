import axios from 'axios';

function create(data) {
    const url= 'http://localhost:49694/beats'
    
    const config={
        method:'POST',
        data:data,
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}


function getAll() {
    const url= 'http://localhost:49694/beats'
    
    const config={
        method:'GET',
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getById(id) {
    const url = 'http://localhost:49694/beats/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}
function getByBeatId(id) {
    const url = 'http://localhost:49694/api/lyrics/beat/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}
function update(data) {
    const url= 'http://localhost:49694/beats'
    const config={
        method:'PUT',
        data:data
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function toggleVisibility(id){
    const url = 'http://localhost:49694/beats/' + id

    const config={
        method:'patch',
    }
    return axios(url,config)
        .then(responseSuccess)
        .catch(responseError)
}

function deleteById(id) {
    const url= 'http://localhost:49694/beats/'+id
    
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
export {create, getAll,getByBeatId, getById,update,deleteById,toggleVisibility}
  
