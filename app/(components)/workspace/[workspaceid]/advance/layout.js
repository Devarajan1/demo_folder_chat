'use client'

import { useEffect } from "react";
import { useAtom } from 'jotai';
import { showAdvanceAtom, userConnectorsAtom, allIndexingConnectorAtom, currentSessionUserAtom } from '../../../../store';

export default function RootLayout({ children }) {
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
     
    const [allConnectorFromServer, setAllConnectorFromServer] = useAtom(allIndexingConnectorAtom)
    const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
   
    async function indexingStatus(){
      
      try {
          const data = await fetch(currentUser?.role === 'admin' ? `/api/manage/admin/connector/indexing-status` : `/api/manage/connector/indexing-status-v2`);
          if(data?.ok){
            const json = await data?.json();
            // console.log(json)
            setAllConnectorFromServer(json)
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
  

    useEffect(()=> {
      indexingStatus()
      const int = setInterval(()=> {
      indexingStatus()
    }, 5000);

    return ()=> {
      clearInterval(int)
    }
      
    }, [])

    useEffect(()=> {
        setShowAdvance(true)
    }, []);

  return (
    <div className='w-full flex font-Inter box-border'>        
        { children }
    </div>
  )
}
