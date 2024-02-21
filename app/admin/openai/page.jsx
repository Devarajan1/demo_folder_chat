'use client'
import React, { useEffect, useState } from 'react'
import { Key, Loader2, Trash, Trash2 } from 'lucide-react'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { apikeyFun, fetchApiKey, deleteApiKey } from '../../../lib/openai';

import { useToast } from '../../../components/ui/use-toast';



function OpenAi() {

    const [existingKey, setExistingKey] = useState(false);
    const [loader, setLoader] = useState(true);
    const [openAiKey, setOpenAiKey] = useState('')

    const { toast } = useToast();


    async function sendOpenAiKey(key){
        if(key === '') return null;
        setLoader(true);

        const res = await apikeyFun(key)
        if(res.ok){
            setOpenAiKey('')
            getkey();
              toast({
                variant: 'default',
                title: "OpenAi Key Added!"
                });
        }else{
            toast({
                variant: 'destructive',
                title: "Unable to set API key. Check if the provided key is valid."
            });
        }
        setLoader(false)
    };

    async function getkey(){
        try {
            const res = await fetchApiKey();
            const json = await res.json()
            if(json?.api_key){
                setExistingKey(json?.api_key)
            }else{
                toast({
                    variant: 'destructive',
                    title: json?.detail
                });
            }
            setLoader(false)
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(()=> {
        getkey();
    }, [])
    return (
        <div className='w-full font-Inter px-8 py-4'>
            {loader && <div className='w-[80%] justify-center h-screen flex items-center z-50 bg-gray-50 opacity-40 self-start select-none fixed'>
                <Loader2 className='animate-spin m-auto' />
            </div>}
            <h2 className='text-3xl text-strong font-bold flex gap-x-2 items-center '><Key /> OpenAI Keys</h2>
            <hr className='my-5' />
            
                <div className='space-y-4'>
                    {!existingKey ?
                    <>
                        <h2 className='font-[500] text-[2xl] leading-6'>Update Key</h2>
                        <p className='font-[400] text-sm leading-5'>Specify an OpenAI API key and click the &quot;Submit&quot; button.</p>
                        </>
                    :
                    <>
                        <h2 className='font-[500] text-[2xl] leading-6'>Existing Key</h2>
                        <div className='flex items-center gap-1'>
                            <p className='font-[400] text-sm leading-5'>sk- ****...**{existingKey}</p>
                            <Trash2 size={14} className='hover:cursor-pointer opacity-40 hover:opacity-100' title='Remove Key' onClick={()=> deleteApiKey()}/>
                        </div>
                    </>
                    }
                    

                    <div className='w-full p-4 space-y-2 border rounded-md'>
                        <Label htmlFor='ai-key'>OpenAI API Key:</Label>
                        <Input type='password' id='ai-key' value={openAiKey} onChange={(e) => setOpenAiKey(e.target.value)}/>
                        <Button className='ml-auto bg-blue-500 hover:bg-blue-600' onClick={()=> sendOpenAiKey(openAiKey)}>Submit</Button>
                    </div>
                </div> 
            
        </div>
    )
}

export default OpenAi