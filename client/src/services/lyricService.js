import axios from 'axios';
import react from 'react'

function create(data) {
    const url= '/lyrics/'
    
    const config={
        method:'POST',
        data:data
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getAll() {
    const url= '/lyrics/'
    
    const config={
        method:'GET',
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getById(id) {
    const url = '/lyrics/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}

function update(id, data) {
    const url= '/lyrics/'+id
    
    const config={
        method:'PUT',
        data:data
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function deleteById(id) {
    const url= '/lyrics/'+id
    
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
export {create, getAll, getById,update,deleteById}