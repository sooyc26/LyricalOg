import {createStore, combineReducers} from 'redux'
import {userReducer,authReducer} from './reducers/userReducer'
import * as jwt_decode from "jwt-decode";

export const loadState = ()=>{
    try{
        const serializedState = localStorage.getItem('loginToken');
        if(serializedState===null){
            return undefined;
        }      
        var loaded = JSON.parse(jwt_decode(serializedState).currUser); 
        return loaded
    }catch(err){
        return undefined;
    }
}

export const saveState= (state) =>{
    try{
        const serilizedState = JSON.stringify(state);
        localStorage.setItem('state',serilizedState)
    }catch(err){
        //ignore for now
    }
}
//reducers
const allReducers=combineReducers({
    user:userReducer,
    authed:authReducer
})

const initialState = {
    user:loadState(),
    authed:localStorage.getItem('loginToken') !==null?true: false
  };

//store
export const store = createStore(
    allReducers,    
    initialState,
    window.devToolsExtension && window.devToolsExtension()
);

