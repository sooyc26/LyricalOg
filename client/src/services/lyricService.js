import axios from 'axios'

function create(createData) {
    const url= '/lyrics/'
    
    const data={
        method:'POST',
        data:createData
    }
    return axios(url,data)
    .then (response=>console.log(response))
    .catch(console.error)
}

export {create}