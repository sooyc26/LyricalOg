import {createStore, combineReducers} from 'redux'
import {userReducer,authReducer} from './reducers/userReducer'

//reducers
const allReducers=combineReducers({
    user:userReducer,
    authed:authReducer
})

const initialState = {
    user:null ,
    authed:localStorage.getItem('loginToken') !==null?true: false
  };
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
