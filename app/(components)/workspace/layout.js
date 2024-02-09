'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { getCurrentUser } from '../../../lib/user';
import { useAtom } from 'jotai';
import { currentSessionUserAtom, workSpacesAtom, workAddedAtom } from '../../store'

export default function RootLayout({ children }) {

    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [userWorkSpaces, setUserWorkSpaces] = useAtom(workSpacesAtom);
    const [workAdded, setWorkAdded] = useAtom(workAddedAtom)

    const router = useRouter();
  
    async function getWork(){
      try {
        const url = currentUser?.role === "admin" ? '/api/workspace/admin/list-workspace' : '/api/workspace/list-workspace-public'
        const res = await fetch(url, {
            method:'GET',
            credentials:'include'
        });
        if(res.ok){
            const json = await res.json()
            setUserWorkSpaces(json?.data)
            if(json?.data?.length > 0){
              
                router.push(`/workspace/${json?.data[0].id}/chat/new`)
            }else{
            router.push(`/workspace/0/chat/new`)
            }
        }
        
      } catch (error) {
        console.log(error)
      }
    }
  
    async function fetchCurrentUser(){
      const user = await getCurrentUser();
      setCurrentUser(user)
    };
  
    useEffect(()=> {
      fetchCurrentUser()
      getWork()
    }, [workAdded])
return (
         children 
    )
}   