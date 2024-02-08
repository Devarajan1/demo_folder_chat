'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { getCurrentUser } from '../../../lib/user';
const WorkSpacePage = () => {
  const [currentUser, setCurrentUser] = useState({})

  const router = useRouter();

  async function getWork(){
    try {
      const url = currentUser.role === "admin" ? '/api/workspace/admin/list-workspace' : '/api/workspace/list-workspace-public'
        const res = await fetch(url);
      const json = await res.json()
      
      if(json?.data?.length > 0){
          router.push(`/workspace/${json?.data[0].id}/chat/new`)
      }else{
        router.push(`/workspace/0/chat/new`)
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
  }, [])
  return (
    null
  )
}

export default WorkSpacePage