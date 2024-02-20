'use server'

import axios from "axios"
import { cookies } from 'next/headers'

export async function signin(email, password){
    
    const formData = new FormData();
    
    formData.append("username", email);
    formData.append("password", password);
    
    // console.log(formData)
    try {
        const response = await axios.post('/api/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log(response)
    return response;
    } catch (error) {
        console.log(error)
    }
}
    


export async function signup(email, password){
    const jsonData = JSON.stringify({
        'email': email,
        'username': email,
        'password': password
    });

    const response = await axios.post('/api/auth/register', jsonData, {
        headers: {
            'Content-Type': 'application/json'
        }
    })

    return response;
}

export async function test(){
    console.log('test server')
}


  export const getCurrentUser = async () => {
    const response = await fetch("/api/manage/me")
    // if (!response.ok) {
    //     console.log(response)
    //   return null;
    // }
    const user = await response.json();
    console.log(user)
    return user;
  };
  