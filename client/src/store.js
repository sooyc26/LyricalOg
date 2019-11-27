import {createStore, combineReducers} from 'redux'
import {userReducer,authReducer} from './reducers/userReducer'
import {throttle} from 'lodash/throttle'
import * as jwt_decode from "jwt-decode";

const loadState = ()=>{
    try{
        const serializedState = localStorage.getItem('loginToken');
        if(serializedState===null){
            return undefined;
        }      
        var loaded = jwt_decode(serializedState);        
        return loaded
    }catch(err){
        return undefined;
    }
}

// const saveState= (state) =>{
//     try{
//         const serilizedState = JSON.stringify(state);
//         localStorage.setItem('state',serilizedState)
//     }catch(err){
//         //ignore for now
//     }
// }
//reducers
const allReducers=combineReducers({
    user:userReducer,
    authed:authReducer
})

const initialState = {
    user:loadState(),
    authed:localStorage.getItem('loginToken') !==null?true: false
  };

  const persistedState = loadState();
//store
export const store = createStore(
    allReducers,
    // {
    //     user: null,
    //     authed:false
    // }
    
    initialState,
    window.devToolsExtension && window.devToolsExtension()
);
// store.subscribe(throttle(()=>{
//     saveState(store.getState())
// },1000));
