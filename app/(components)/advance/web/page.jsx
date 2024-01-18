'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

import webIcon from '../../../../public/assets/Danswer-web-B.svg'

import check from '../../../../public/assets/check-circle.svg';
import trash from '../../../../public/assets/trash-2.svg';

import { Label } from '../../../../components/ui/label';
import { useToast } from '../../../../components/ui/use-toast';
import { deleteConnectorFromTable, fetchAllConnector, getSess } from '../../../../lib/helpers';
import { useAtom } from 'jotai';
import { sessionAtom, userConnectorsAtom, showAdvanceAtom } from '../../../store';
import supabase from '../../../../config/supabse';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../../components/ui/table";
import { Loader, Loader2 } from 'lucide-react';

const Web = () => {

    const [webUrl, setWebUrl] = useState('');
    const [webList, setWebList] = useState([]);
    const [connectorId, setConnectorId] = useState(null);
    const [credentialID, setCredentialID] = useState(null);
    const [allConnectors, setAllConnectors] = useAtom(userConnectorsAtom);
    const [session, setSession] = useAtom(sessionAtom);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [existConnector ,setExistConnector] = useState([]);
    
    const { toast } = useToast();
    

    async function addList(url) {
        
        if (url === '') {
            return toast({
                variant: 'destructive',
                description: 'Please Provide a valid URL'
            })
        } else {
            setUploading(true)
            await connectorRequest(webUrl)
            
        }
    };

    async function connectorRequest(baseName) {
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/admin/connector`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": `WebConnector-${baseName}`,
                    "source": "web",
                    "input_type": "load_state",
                    "connector_specific_config": {
                        "base_url": baseName,
                        "web_connector_type": "single"
                    },
                    "refresh_freq": 86400,
                    "disabled": false
                })
            }
                
            );
            const json = await data.json();
            setConnectorId(json.id)
            if(existConnector.length === 0){
                
                await insertDataInConn([json.id])
            }else{
                await updatetDataInConn(existConnector, json.id)
            }
            await getCredentials(json?.id, baseName)
        } catch (error) {
            console.log('error while connectorRequest :', error)
        }        
    };

    async function insertDataInConn(newData){
        
        const { data, error } = await supabase
        .from('connectors')
        .insert(
          { 'connect_id': newData, 'user_id' : session?.user?.id },
        )
        .select()
        // console.log(data)
        // console.log(error)
        setExistConnector(data[0]?.connect_id);
       
    };

    async function updatetDataInConn(exConn, newData){
        
        const allConn = [...exConn, newData]
        const { data, error } = await supabase
        .from('connectors')
        .update(
          { 'connect_id': allConn},
        )
        .eq('user_id', session?.user?.id)
        .select()
        console.log(data)
        console.log(error)
        setExistConnector(data[0]?.connect_id);
        
    };

    async function getCredentials(id, baseName){
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/credential`, {
            method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    
                },
                body: JSON.stringify(
                    {
                        "credential_json": {
                            "id":"12"
                        },
                        "admin_public": false
                    }
                )
            });
            const json = await data?.json();
            
            setCredentialID(json?.id);
            sendURL(id, json?.id, baseName);
        } catch (error) {
            console.log('error while getCredentials:', error)
        }
    };

    async function sendURL(connectID, credID, url){
        
        if(connectID === null || credID === null || url === '') return null
        try {
            const data = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/manage/connector/${connectID}/credential/${credID}`, {
            method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 'name':url })
            });
            const json = await data?.json();
            setWebUrl('')
            setUploading(false)
            setCredentialID(null);
            setConnectorId(null)
        } catch (error) {
            console.log('error while sendURL:', error)
        }
    };

    async function deleteConnector(id1, id2){
        return null
        try {
            const body = {
                "connector_id": id1,
    		    "credential_id": id2
            };
            const res = await deleteConnectorFromTable(body)
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(()=> {

        if(allConnectors !== null ){
            const filData = allConnectors?.filter((item)=> item?.connector?.source === 'web');
            if(filData.length > 0){
                setWebList(filData);
                
                const conn_ids = filData?.map(conn => {return conn?.connector?.id});
                
                setExistConnector(conn_ids)
            };
            setLoading(false)
        }
        
    }, [allConnectors]);



    return (
        <div className='w-full sticky top-0 self-start h-screen flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
             <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar h-full px-4 py-10'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={webIcon} alt='file' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Web</h1>
                </div>
                <hr className='w-full' />

                <div className='w-full self-start'>
                    <div className='text-start flex flex-col gap-4 '>
                        <div className='space-y-1'>
                            <h2 className='font-[600] text-sm leading-5 text-[#0F172A]'>Specify which websites to index</h2>
                            <p className='font-[400] text-sm leading-5'>We re-fetch the latest state of the website once a day</p>
                        </div>
                        {!uploading ? 
                        <div className={`w-full border rounded-lg flex flex-col justify-center text-start items-center p-5 gap-4 bg-slate-100 shadow-md`}>
                            <div className='w-full space-y-2 text-start '>
                                <Label htmlFor='web_url'>URL to index:</Label>
                                <Input type='text' id='web_url' className='w-full' placeholder='web url' value={webUrl} onChange={(e) => {
                                    setWebUrl(e.target.value)
                                }} />
                                <Button onClick={() => addList(webUrl)}>Connect</Button>
                            </div>
                        </div>
                        :
                        <div className={`w-full border rounded-lg flex flex-col justify-center text-start items-center p-10 gap-4 bg-slate-100 shadow-md`}>
                            <Loader className='animate-spin' />
                        </div>
                        }
                    </div>
                </div>
                <Table className='w-full text-sm'>
                    <TableHeader className='p-2'>
                        <TableRow className='border-b p-2 hover:bg-transparent'>
                            <TableHead className="w-96 text-left p-2">Base URL</TableHead>
                            <TableHead className='text-center'>Status</TableHead>
                            {/* <TableHead className="text-center">Remove</TableHead> */}
                        </TableRow>
                    </TableHeader>
                    {loading && <div className='w-full text-start p-2'>Loading...</div>}
                    <TableBody className='w-full'>
                        { 
                        webList?.map((item, idx) => {
                            
                            return (
                                <TableRow className='border-b' key={idx}>
                                    <TableCell className="font-medium w-96 text-left px-2 py-3 text-ellipsis break-all text-emphasis overflow-hidden">{item?.name}</TableCell>
                                    <TableCell>
                                        <div className='flex justify-center items-center gap-1 text-[#22C55E]'>
                                            <Image src={check} alt='checked' className='w-4 h-4' />Running!
                                        </div>
                                    </TableCell>
                                    {/* <TableCell><Image src={trash} alt='remove' className='m-auto hover:cursor-pointer' onClick={()=> deleteConnector(item.id, item.credential_ids[0])}/></TableCell> */}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}

export default Web