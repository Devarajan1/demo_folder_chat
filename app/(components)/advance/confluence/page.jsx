'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import supabase from '../../../../config/supabse';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';

import conIcon from '../../../../public/assets/Danswer-confluence-B.svg';

import check from '../../../../public/assets/check-circle.svg';
import trash from '../../../../public/assets/trash-2.svg';
import { useToast } from '../../../../components/ui/use-toast';
import { fetchAllConnector, fetchAllCredentials, deleteConnector, generateConnectorId, addNewInstance, deleteAdminCredentails, fetchCredentialID } from '../../../../lib/helpers';
import { useAtom } from 'jotai';
import { sessionAtom, userConnectorsAtom } from '../../../store';
import { Loader2 } from 'lucide-react';

const Confluence = () => {
    const [session, setSession] = useAtom(sessionAtom)
    const [con_token, setConToken] = useState('');
    const [tokenValue, setTokenValue] = useState('');
    const [userName, setUserName] = useState('');
    const [conUrlList, setConUrlList] = useState([]);
    const [conUrl, setConUrl] = useState('');
    const [loading, setLoading] = useState(true)
    const [tokenStatus, setTokenStatus] = useState(false)
    const [credentialID, setCredentialID] = useState(null);
    const [connectorID, setConnectorID] = useState(null);
    const [existingCredentials, setExistingCredentials] = useState([])
    const [conJson, setConJson] = useState(null);
    const [isAdminLoad, setIsAdminLoad] = useState(true);
    const [allConnectors, setAllConnectors] = useAtom(userConnectorsAtom);

    const { toast } = useToast();

    async function getAllCred() {
        try {
            const data = await fetchAllCredentials();
            // console.log(data)
            const allCred = await readData();
            
            const currentUserToken = data?.filter((res) => { if(allCred?.includes(res?.id)) return res});
            // console.log(currentUserToken)
            const currentToken = currentUserToken.filter(res => res?.credential_json?.confluence_username !== undefined);
            // console.log(currentToken)

            const conCred = currentToken?.filter(cred => cred?.credential_json?.confluence_username);
            // console.log(conCred)
            if(conCred.length > 0){
                setIsAdminLoad(false)
                setConJson(conCred[0])
            }else{
                setConJson(null)
                setIsAdminLoad(false)
            }

        } catch (error) {
            setConJson(null)
                setIsAdminLoad(false)
            console.log('error in getALlCred:', error)
        }
    };

    async function getAllExistingConnector() {
        try {
            const data = await fetchAllConnector();
            const currentConnector = data?.filter(conn => conn.source === 'confluence');
            if(currentConnector.length > 0){
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

    function addToken(token, user) {
        if (token === '' || user === '') {
            return toast({
                variant: 'destructive',
                description: 'Please Provide Valid Credentials!'
            })
        } else {
            setConToken(token);
            getCredentialId(token, user)
            setTokenValue('');
            setUserName('');
        }
    };

    async function getCredentialId(token, username) {
        try {
            const body = {
                "credential_json": {
                    "confluence_username": username,
                    "confluence_access_token": token
                },
                "admin_public": false
            }
            const data = await fetchCredentialID(body);
            if(existingCredentials.length === 0){
                
                await insertDataInCred([data])
            }else{
                await updatetDataInCred(existingCredentials, data)
            }
            await getAllCred()
            setCredentialID(data);
            setTokenStatus(true)
        } catch (error) {
            console.log('error while getting credentails:', error)
        }
    }

    async function getConnectorId(space_url) {
        try {
            // await checkExistingConnector(space_url);

            const body = {
                "name": `ConfluenceConnector-${space_url}`,
                "source": "confluence",
                "input_type": "poll",
                "connector_specific_config": {
                    "wiki_page_url": space_url
                },
                "refresh_freq": 600,
                "disabled": false
            }
            const data = await generateConnectorId(body);
            if(data.detail){
                return toast({
                    variant:'destructive',
                    description:data.detail
                })
            }
            setConnectorID(data.id);
            await addNewSpace(data.id, conJson.id, space_url)

        } catch (error) {
            console.log('error while getting credentails:', error)
        }
    };

    async function addNewSpace(conId, credId, url) {
        try {
            const name = url.split('/')[5];
            const data = await addNewInstance(conId, credId, name);
            setTokenStatus(true)
            addLisrUrl(url);
            // console.log(data);
        } catch (error) {
            console.log(error)
        }
    }

    async function deleteToken(id){
        try {
            const data = await deleteAdminCredentails(id);
            await getAllCred()
            return toast({
                variant:"default",
                description:'Credentials Deleted !'
            })
        } catch (error) {
            return toast({
                variant:"destructive",
                description:'Must Delete All Confluence Connector Before Delete Credentials'
            })
            
        }
        
    }
    function addLisrUrl(url) {
        if (tokenStatus) {
            if (url === '') {
                return toast({
                    variant: 'destructive',
                    description: 'Please Provide Valid URL!'
                })
            }
            
            setConUrl('')
            return null
        } else {
            return toast({
                variant: 'destructive',
                description: 'You Are Not Authenticated!'
            })
        }
    };

    function handleRemoveToken() {
        deleteToken(conJson.id);
        setConToken('');
        setTokenStatus(false)
    };


    async function insertDataInCred(newData){
        // const id = await getSess();
        try {
            // console.log(newData, session.user.id)
            const { data, error } = await supabase
            .from('credentials')
            .insert(
            { 'cred_ids': newData, 'user_id' : session.user.id },
            )
            .select();

            if(error){
                throw error
            }
            setExistingCredentials(data[0]?.cred_ids)
        } catch (error) {
            setExistingCredentials([])
            console.log(error)
        }
    };

    async function updatetDataInCred(exConn, newData){
        // const id = await getSess();
        const allConn = [...exConn, newData]
        const { data, error } = await supabase
        .from('credentials')
        .update(
          { 'cred_ids': allConn },
        )
        .eq('user_id', session.user.id)
        .select()
        // console.log(data)
        console.log(error)
        setExistingCredentials(data[0]?.cred_ids)
    };

    async function readData(){
        // const id = await getSess();
        try {
            const { data, error } = await supabase
            .from('credentials')
            .select('cred_ids')
            .eq('user_id', session?.user?.id);
            // console.log(data);
            if(error){
                setExistingCredentials([]);
                throw error
            }
            if(data[0]?.cred_ids === null){
                setExistingCredentials([]);
                return []
            }
            else{
                setExistingCredentials(data[0]?.cred_ids);
                return data[0]?.cred_ids
            }
        } catch (error) {
            console.log(error);
            return []
        }
    }; 

    useEffect(() => {
        readData();
        getAllCred();
        getAllExistingConnector();
    }, []);


    if(isAdminLoad){
        return (
            <div className='w-full flex h-screen items-center justify-center'>
                <Loader2 className='animate-spin' />
            </div>
        )
    }


    return (
        <div className='w-full sticky top-0 self-start h-screen flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
            <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar h-full px-4 py-10'>
                <div className='flex justify-start items-center gap-2'>
                    <Image src={conIcon} alt='github' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Confluence</h1>
                </div>
                <hr className='w-full' />

                <div className='self-start text-sm leading-5 flex flex-col gap-2 w-full'>

                    <h2 className='font-[600]  text-start'>Step 1: Provide your access token</h2>

                    {conJson === null && <p className='font-[400] text-start'>To use Confluence connector, you must first follow the guide described here to generate an Access Token</p>}

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
                <>
                    <div className='self-start text-sm leading-5 flex flex-col gap-2'>
                        <h2 className='font-[600] break-words text-start'>Step 2: Which spaces do you want to make searchable?</h2>
                        <span className='font-[400] text-[12px] text-start'>To use the Confluence connector, you must first follow the guide described here to give the Danswer backend read access to your documents. Once that is setup, specify any link to a Confluence page below and click “index” to Index. Based on the provided link, we will index the ENTIRE SPACE, not just the specified page. For example, entering https://danswer.atlassian.net/wik/spaces/Engineering/overview and clicking the Index button will index the whole Engineering Confluence space</span>
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
                </>

                <table className='w-full text-sm'>
                    <thead className='p-2 w-full'>
                        <tr className='border-b p-2'>
                            <th className="text-left p-2">Connected URLs</th>
                            <th className='text-center'>Status</th>
                            <th className='text-center'>Credential</th>
                            <th className="text-center">Remove</th>
                        </tr>
                    </thead>
                    {loading && <div className='w-full text-start p-2'>Loading...</div>}
                    <tbody className='w-full'>
                        {conUrlList.map((item, idx) => {
                            return (
                                <tr className='border-b hover:cursor-pointer w-full' key={idx}>
                                    <td className="font-medium text-left justify-start p-2 py-3 text-ellipsis break-all line-clamp-1 text-emphasis">{item?.connector_specific_config?.wiki_page_url}</td>
                                    <td className=''>
                                        <div className='flex justify-center items-center gap-1 text-[#22C55E]'>
                                            <Image src={check} alt='checked' className='w-4 h-4' />Enabled
                                        </div>
                                    </td>
                                    <td className=''>{conJson?.credential_json?.confluence_access_token}</td>
                                    <td><Image src={trash} alt='remove' className='m-auto hover:cursor-pointer' /></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}

export default Confluence