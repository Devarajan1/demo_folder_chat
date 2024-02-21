import React, { useEffect, useRef, useState } from 'react'
import { DialogContent } from '../../../../../../components/ui/dialog';
import { cn } from '../../../../../../lib/utils';
import { Loader2 } from 'lucide-react';
import { Button } from '../../../../../../components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../../../../../components/ui/tooltip"
import { useToast } from '../../../../../../components/ui/use-toast';
import { currentSessionUserAtom, userConnectorsAtom, folderIdAtom, tempAtom } from '../../../../../store';
import { useAtom } from 'jotai';


const EditIndex = ({ cc_pair_id, setOpen, getAllExistingConnector }) => {

    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom)
    const [connectorDetails, setConnectorDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const body = useRef(null)

    async function connectorStatus(id) {
        try {
            const data = await fetch(`/api/manage/cc-pair/${id}`)
            const json = await data.json();
            setConnectorDetails(json);
            body.current = json
            
        } catch (error) {
            console.log(error)
        }
    };

    async function disableConnector(bodyData){
        
        bodyData.current.connector.disabled = !bodyData.current.connector.disabled
        
        try {
            const data = await fetch(`/api/manage/connector-v2/${bodyData.current.connector.id}`, {
                credentials:'include',
                method:'PATCH',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify(bodyData.current.connector)
            });
            if(data?.ok){
                const json = await data.json();
                const updatedData = {
                ...connectorDetails,
                connector: {
                  ...connectorDetails.connector,
                  disabled: json.disabled
                },
              };
              setConnectorDetails(updatedData);
              if(bodyData.current.connector.disabled){
                toast({
                    variant:'default',
                    description:'Connector disabled successfully!'
                  })
              }else{
                toast({
                    variant:'default',
                    description:'Connector enabled successfully!'
                  })
              }
            }
        } catch (error) {
            console.log(error)
        }
    }
    async function deleteConnector(bodyData){
        if(!bodyData.current.connector.disabled) return null
        setLoading(true)
        try {
            const data = await fetch(`${currentUser?.role === 'admin' ? '/api/manage/admin/deletion-attempt': '/api/manage/deletion-attempt-v2'}`, {
                credentials:'include',
                method:'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    "connector_id": bodyData?.current?.connector?.id,
                    "credential_id": bodyData?.current?.credential?.id
            })
            });

            if(data?.ok){
                toast({
                    variant:'default',
                    description:'Connector deleted successfully!'
                });
                setOpen(false)
            }
            
        } catch (error) {
            console.log(error)
        }
    }
    
    useEffect(() => {
        connectorStatus(cc_pair_id)
    }, []);

    if (connectorDetails === null || loading) {
        return <Loader2 className='animate-spin m-auto' />
    }
    return (

        <div className='w-full space-y-10 break-all flex flex-col'>
            <h1 className='text-lg font-[600] px-2 text-start'>{connectorDetails?.name}</h1>
            <div className='w-full flex justify-around'>
                <Button className={cn(`${body?.current?.connector?.disabled ? 'bg-[#14B8A6] hover:bg-[#14B8A6]' : 'bg-[#F6BE00] hover:bg-[#F6BE00]'} hover:opacity-75`)} onClick={()=> disableConnector(body)}>{body.current.connector.disabled ? 'Re-Enable' : 'Disable'}</Button>
                <TooltipProvider >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={'destructive'} className={cn(connectorDetails?.connector?.disabled ? 'cursor-pointer ' : 'cursor-not-allowed opacity-50')} onClick={()=> deleteConnector(body)}>Delete</Button>
                            
                        </TooltipTrigger>
                        {!connectorDetails?.connector?.disabled && <TooltipContent className={cn('w-[60%] break-words m-auto text-justify bg-gray-500 text-white opacity-90')}>
                                <p className='text-sm leading-5 font-[400] '>You must disable the connector first before deleting it</p>
                        </TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}

export default EditIndex