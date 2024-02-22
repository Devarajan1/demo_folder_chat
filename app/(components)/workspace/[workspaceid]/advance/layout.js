'use client'

import { useEffect } from "react";
import { useAtom } from 'jotai';
import { showAdvanceAtom, userConnectorsAtom, currentSessionUserAtom } from '../../../../store';

export default function RootLayout({ children }) {
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    

    useEffect(()=> {
        setShowAdvance(true)
    }, []);

  return (
    <div className='w-full flex font-Inter box-border'>        
        { children }
    </div>
  )
}
