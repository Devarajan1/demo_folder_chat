'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../../../../components/ui/table";
  
import { Dialog, DialogTrigger, DialogContent } from '../../../../../../components/ui/dialog';
import conIcon from '../../../../../../public/assets/confluence-B.svg';
import { statusBackGround } from '../../../../../../config/constants';
import trash from '../../../../../../public/assets/trash-2.svg';
import { useToast } from '../../../../../../components/ui/use-toast';
import { useAtom } from 'jotai';
import { userConnectorsAtom, currentSessionUserAtom } from '../../../../../store';
import { Loader2 } from 'lucide-react';
import EditIndex from '../(component)/EditIndex';

const Confluence = () => {
    
    const [tokenValue, setTokenValue] = useState('');
    const [userName, setUserName] = useState('');
    const [conUrlList, setConUrlList] = useState([]);
    const [conUrl, setConUrl] = useState('');
    const [loading, setLoading] = useState(true)
    const [tokenStatus, setTokenStatus] = useState(false)
    const [conJson, setConJson] = useState(null);
    const [isAdminLoad, setIsAdminLoad] = useState(true);
    const [allConnectors, setAllConnectors] = useAtom(userConnectorsAtom);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);

    const { toast } = useToast();

    async function getAdminCredentials() {
        try {
            const data = await fetch(`/api/manage/credential`);
            if(data?.ok){
                const json = await data.json();
                
                const currentUserTokens = json?.filter(res => res?.user_id === currentUser?.id)
                
                const currentConfluenceToken = currentUserTokens?.filter(item => item?.credential_json?.confluence_access_token !== undefined)
                
                if(currentConfluenceToken?.length > 0){
                    setIsAdminLoad(false)
                    setConJson(currentConfluenceToken[0])
                }else{
                    setConJson(null)
                    setIsAdminLoad(false)
                }
            }
        } catch (error) {
            setConJson(null)
            setIsAdminLoad(false)
            console.log('error in getALlCred:', error)
        }
    };

    async function getAllExistingConnector() {
        try {
            const currentConnector = allConnectors?.filter(item => item?.connector?.source === 'confluence');
            if(currentConnector?.length > 0){
                setConUrlList(currentConnector)
            }else{
                setConUrlList([])
            };
            setLoading(false)
        } catch (error) {
            console.log(error)
            setConUrlList([])
            setLoading(false)
        }
    }

    async function addToken(token, user) {
        if (token === '' || user === '') {
            return toast({
                variant: 'destructive',
                description: 'Please provide valid credentials!'
            })
        } else {
            await getCredentials(token, user)
            setTokenValue('');
            setUserName('');
        }
    };

    async function getCredentials(token, username) {
        try {
            const data = await fetch(`/api/manage/credential`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "credential_json": {
                        "confluence_username": username,
                        "confluence_access_token": token
                    },
                    "admin_public": false
                })
            });
            if(data?.ok){
                const json = await data.json();
                await getAdminCredentials()
                setTokenStatus(true)
            }
        } catch (error) {
            console.log('error while getting credentails:', error)
        }
    }

    async function getConnectorId(space_url) {
        if(space_url === ''){
            return toast({
                variant: 'destructive',
                description: 'Please provide valid space url!'
            })
        }
        try {
            const data = await fetch(currentUser?.role === 'admin' ? `/api/manage/admin/connector` : `/api/manage/connector-v2`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": `ConfluenceConnector-${space_url}`,
                    "source": "confluence",
                    "input_type": "poll",
                    "connector_specific_config": {
                        "wiki_page_url": space_url
                    },
                    "refresh_freq": 600,
                    "disabled": false
                })
            });
            if(data?.ok){
                const json = await data.json();
                if(json?.detail){
                    return toast({
                        variant:'destructive',
                        description:data.detail
                    })
                }
                await addNewSpace(json?.id, conJson?.id, space_url)
            }

        } catch (error) {
            console.log('error while getting credentails:', error)
        }
    };

    async function addNewSpace(conId, credId, url) {
        try {
            const name = url.split('/')[5];
            const data = await fetch(`/api/manage/connector/${conId}/credential/${credId}`,{
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name
            })
            });
            if(data?.ok){
                setTokenStatus(true)
                addLisrUrl(url);
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function deleteToken(id){
        if(conUrlList?.length > 0){
            return toast({
                variant:"destructive",
                description:'Must delete all confluence connector before delete credentials.'
            })
        }
        try {
            const data = await fetch(currentUser?.role === 'admin' ? `/api/manage/admin/credential/${id}` : `/api/manage/credential/${id}`, {
                method:'DELETE'
            });
            if(data?.ok){
                await getAdminCredentials()
                return toast({
                    variant:"default",
                    description:'Credentials deleted !'
                })
            }
        } catch (error) {
            console.log(error)            
        }
        
    }
    function addLisrUrl(url) {
        if (tokenStatus) {
            if (url === '') {
                return toast({
                    variant: 'destructive',
                    description: 'Please provide valid URL!'
                })
            }
            
            setConUrl('')
            return null
        } else {
            return toast({
                variant: 'destructive',
                description: 'You are not authenticated!'
            })
        }
    };

    function handleRemoveToken() {
        deleteToken(conJson?.id);
        setTokenStatus(false)
    }; 

    useEffect(() => {
        getAdminCredentials();
        
    }, []);

    useEffect(()=> {
        getAllExistingConnector();
    }, [allConnectors])


    if(isAdminLoad){
        return (
            <div className='w-full flex h-screen items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>
        )
    }


    return (
        <div className='w-full min-h-screen flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
            <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar h-full px-4 py-10'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={conIcon} alt='github' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Confluence</h1>
                </div>
                <hr className='w-full' />

                <div className='self-start text-sm leading-5 flex flex-col gap-2 w-full'>

                    <h2 className='font-[600]  text-start'>Step 1: Provide your access token</h2>
                    {conJson !== null ? 
                        <span className='font-[400] inline-flex items-center'>
                        Existing Access Token: {conJson?.credential_json?.confluence_access_token} 
                        <Image src={trash} alt='remove' className='w-4 h-4 inline hover:cursor-pointer' onClick={() => handleRemoveToken()} />
                        </span>
                        :
                        <div className='w-full space-y-2 text-start border p-4 rounded-lg bg-slate-100 shadow-md'>
                            <Input type='text' className='w-full' placeholder='Username' value={userName} onChange={(e) => setUserName(e.target.value)} />
                            <Input type='password' className='w-full' placeholder='Access Token' value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} />
                            <Button onClick={() => { addToken(tokenValue, userName) }}>Update</Button>
                        </div>
                    }

                </div>
                {conJson !== null && <>
                    <div className='self-start text-sm leading-5 flex flex-col gap-2'>
                        <h2 className='font-[600] break-words text-start'>Step 2: Which spaces do you want to make searchable?</h2>
                        <span className='font-[400] text-[12px] text-start break-all'>Based on the provided link, we will index the ENTIRE SPACE, not just the specified page. For example, entering https://folderchat.atlassian.net/wik/spaces/Engineering/overview and clicking the Index button will index the whole Engineering Confluence space</span>
                    </div>

                    <div className='w-full self-start p-5 border rounded-lg bg-slate-100 shadow-md'>
                        <div className='text-start flex flex-col gap-4'>
                            <h2 className='font-[500] text-[16px] leading-6 text-[#0F172A]'>Add New Space</h2>
                            <Input placeholder='Confluence URL' type='text' value={conUrl} onChange={(e) => setConUrl(e.target.value)} />

                            <Button className='w-20' onClick={() => {
                                getConnectorId(conUrl)
                            }}>Connect</Button>
                        </div>
                    </div>
                </>}

                <Table className='w-full text-sm'>
                    <TableHeader className='p-2 w-full'>
                        <TableRow className='border-b p-2 hover:bg-transparent'>
                            <TableHead className="text-left p-2">Connected URLs</TableHead>
                            <TableHead className='text-center'>Status</TableHead>
                            <TableHead className='text-center'>Credential</TableHead>
                            <TableHead className="text-center">Remove</TableHead>
                        </TableRow>
                    </TableHeader>
                    {loading && <TableRow><TableCell colSpan={3} className='w-full text-start p-2'>Loading...</TableCell></TableRow>}
                    <TableBody className='w-full'>
                        {conUrlList.map((item) => {
                            return (
                                <TableRow className='border-b hover:cursor-pointer w-full' key={item?.cc_pair_id}>
                                    <TableCell className="font-medium w-[80%] text-left p-2 py-3 text-ellipsis break-all text-emphasis overflow-hidden">{item?.name}</TableCell>
                                    <TableCell className=''>
                                    <div className={`flex justify-center items-center gap-1 ${statusBackGround(item)} p-1 rounded-full `}>
                                        
                                        {`${!item?.connector?.disabled ? item?.latest_index_attempt?.status || 'Processsing' : 'Disabled'}`}
                                    </div>
                                    </TableCell>
                                    <TableCell className=''>{conJson?.credential_json?.confluence_access_token}</TableCell>
                                    <TableCell>
                                    <Dialog onOpenChange={getAllExistingConnector}>
                                            <DialogTrigger asChild>
                                                <Image src={trash} alt='remove' className='m-auto hover:cursor-pointer'/>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <EditIndex cc_pair_id={item.cc_pair_id} />
                                            </DialogContent>
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

        </div>
    )
}

export default Confluence