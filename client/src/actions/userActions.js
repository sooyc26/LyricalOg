export const UPDATE_USER = 'updateUser'
export const AUTH_USER = 'authenticateUser'

export function updateUser(newUser){
    
    return{
        type:UPDATE_USER,
        payload:{
            user:newUser
        }
    }
}

export function authUser(){
    
    return{
        type:AUTH_USER,
        payload:{
            authed:true
        }
    }
}