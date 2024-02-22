'use client'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { getCurrentUser } from '../../../lib/user';
import { useAtom } from 'jotai';
import { currentSessionUserAtom, workSpacesAtom, workAddedAtom, folderIdAtom, userConnectorsAtom } from '../../store'
import { useParams } from 'next/navigation';

export default function RootLayout({ children }) {

  const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
  const [userWorkSpaces, setUserWorkSpaces] = useAtom(workSpacesAtom);
  const [workAdded, setWorkAdded] = useAtom(workAddedAtom);
  const [folderId, setFolderId] = useAtom(folderIdAtom);
  const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
  const { workspaceid, chatid } = useParams();

  const router = useRouter();
  
  async function indexingStatus(){
    try {
        const data = await fetch(currentUser?.role === 'admin' ? `/api/manage/admin/connector/indexing-status` : `/api/manage/connector/indexing-status-v2`);
        if(data?.ok){
          const json = await data?.json();
          if(currentUser?.role === 'admin'){
              setUserConnectors(json)
          }else{
              const currentUserData = json.filter(item => item.owner === currentUser?.email)
              setUserConnectors(currentUserData)
          }
          
        }else{
          setUserConnectors([])
        }
    } catch (error) {
        setUserConnectors([])
        console.log(error)
    }
  };

  async function getWork(user) {

    try {
      const url = user?.role === "admin" ? '/api/workspace/admin/list-workspace' : '/api/workspace/list-workspace-public'
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });
      if (res?.ok) {
        const json = await res.json()
        setUserWorkSpaces(json?.data)
        // if (chatid == 'new') {
        //   if (json?.data?.length > 0) {
        //     router.push(`/workspace/${json?.data[json?.data?.length - 1].id}/chat/new`);
        //     if (chatid && chatid !== 'new') {
        //       router.push(`/workspace/${workspaceid}/chat/${chatid}`);
        //     } else if (workspaceid && workspaceid !== '0') {
        //       router.push(`/workspace/${workspaceid}/chat/new`);
        //     } else {
        //       router.push(`/workspace/${json?.data[json?.data?.length - 1].id}/chat/new`);
        //     }
        //   } else {
        //     router.push(`/workspace/0/chat/new`)
        //   }
        // }
        if (json?.data?.length > 0) {
          //router.push(`/workspace/${json?.data[json?.data?.length - 1].id}/chat/new`);
          if (chatid && chatid !== 'new') {
            setFolderId(localStorage.getItem('lastFolderId'))
            router.push(`/workspace/${workspaceid}/chat/${chatid}`);
          } else if (workspaceid && workspaceid !== '0') {
            setFolderId(localStorage.getItem('lastFolderId'))
            router.push(`/workspace/${workspaceid}/chat/new`);
          } else {
            router.push(`/workspace/${json?.data[json?.data?.length - 1].id}/chat/new`);
          }
        } else {
          router.push(`/workspace/0/chat/new`)
        }
      }

    } catch (error) {
      console.log(error)
    }
  }

  async function fetchCurrentUser() {
    const user = await getCurrentUser();
    setCurrentUser(user)
    await getWork(user)
  };

  useEffect(() => {
    fetchCurrentUser()
  }, [workAdded])

  useEffect(()=> {
    indexingStatus()
    const int = setInterval(()=> {
    indexingStatus()
  }, 5000);

  return ()=> {
    clearInterval(int)
  }
    
  }, [])
  
  return (
    children
  )
}   