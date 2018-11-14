import axios from 'axios';

function create(data) {
    const url= 'http://localhost:49694/api/lyrics'
    
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
    const url= 'http://localhost:49694/api/lyrics'
    
    const config={
        method:'GET',
        //withCredentials: true

    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function getById(id) {
    const url = 'http://localhost:49694/api/lyrics/' + id

    return axios.get(url)
        .then(responseSuccess)
        .catch(responseError)
}

function update(id, data) {
    const url= 'http://localhost:49694/api/lyrics/'+id
    
    const config={
        method:'PUT',
        data:data
    }
    return axios(url, config)
        .then(responseSuccess)
        .catch(responseError)
}

function deleteById(id) {
    const url= 'http://localhost:49694/api/lyrics/'+id
    
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

/*
split an array and add the splitted items at end of the array
example {2,3,4,5,6}
{4,5,6,2,3}

let returnArray=[];
for (let i=2; i<array.length;i++){
	returnArray.push(array[i])
}

returnArray.push(array[0]);
returnArray.push(array[1]);

return returnArray;

O(n)

Can you create a component with text box and button on button click toggle css for textbox please choose reactjs.

import React from 'react'

class TextBoxToggle extends React.Component{
	constructor(props){
  	super(props);
    
    this.state ={
    	toggle:false
    }
    
    this.onToggle=this.onToggle.bind(this);
  }
  
  onToggle(){
  if(this.state.toggle){
  	this.setState({
    toggle:false
    })
    }else{
      	this.setState({a
    		toggle:true
    		})
    	}
  }

	render(){
		return(
    <div>
    <button onClick={()=>this.onToggle()}> toggle <button/>
    <input style={this.state.toggle?{{border:'5px'}}:'' }><input/>
    <div/>
		)
	}
}
*/ 