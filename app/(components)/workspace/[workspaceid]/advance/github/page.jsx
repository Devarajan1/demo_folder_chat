'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { Input } from '../../../../../../components/ui/input';
import { Button } from '../../../../../../components/ui/button';
import gitIcon from '../../../../../../public/assets/github-B.svg';
import trash from '../../../../../../public/assets/trash-2.svg';
import { useToast } from '../../../../../../components/ui/use-toast';
import { statusBackGround } from '../../../../../../config/constants';
import { Dialog, DialogTrigger, DialogContent } from '../../../../../../components/ui/dialog';
import EditIndex from '../(component)/EditIndex';
import { useAtom } from 'jotai';
import { userConnectorsAtom, currentSessionUserAtom } from '../../../../../store';
import { Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../../../../../components/ui/table";



const GitPrs = () => {
    
    const [tokenValue, setTokenValue] = useState('');
    const [repos, setRepos] = useState([]);
    const [repoOwner, setRepoOwner] = useState('');
    const [repoName, setRepoName] = useState('');
    const [tokenStatus, setTokenStatus] = useState(false);
    const [adminCredential, setAdminCredential] = useState(null);
    const [isAdminLoad, setIsAdminLoad] = useState(true)
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [allConnectors, setAllConnectors] = useAtom(userConnectorsAtom);

    const { toast } = useToast();


    async function getAdminCredentials(){
        try {
            const data = await fetch(`/api/manage/credential`);
            if(data?.ok){
                const json = await data.json();
                const currentUserTokens = json?.filter(res => res?.user_id === currentUser?.id)
                const currentGitToken = currentUserTokens?.filter(item => item?.credential_json?.github_access_token !== undefined)
                
                if(currentGitToken?.length > 0){
                    setAdminCredential(currentGitToken[0]);
                    setTokenStatus(true)
                }else{
                    setAdminCredential(null);
                }
                setIsAdminLoad(false)
            }
            
            } catch (error) {
                setIsAdminLoad(false)
                console.log(error)
            }
    }


    async function getCredentials(token) {
        try {
            const data = await fetch(`/api/manage/credential`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "credential_json": {
                        "github_access_token": token
                    },
                    "admin_public": true
                })
            });
            if(data?.ok){
                
                await getAdminCredentials()
                setTokenStatus(true)
            }
            
        } catch (error) {
            console.log('error while getting credentails:', error)
        }
    }

    async function getConnectorId(owner_name, repo_name) {
        try {
            const full_name = `${owner_name}/${repo_name}`
            const isRepoExist = repos.filter(item => item?.name === full_name);
            if(isRepoExist.length > 0){
                return toast({
                    variant:'destructive',
                    description:'Connector already exist.'
                })
            }

            const data = await fetch(currentUser?.role === 'admin' ? `/api/manage/admin/connector` : `/api/manage/connector-v2`,{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": `GithubConnector-${owner_name}/${repo_name}`,
                    "source": "github",
                    "input_type": "poll",
                    "connector_specific_config": {
                        "repo_owner": `${owner_name}`,
                        "repo_name": `${repo_name}`,
                        "include_prs": true,
                        "include_issues": true
                    },
                    "refresh_freq": 600,
                    "disabled": false
                })
            });
            const json = await data.json();
            if(json?.detail){
                return toast({
                    variant:'destructive',
                    description:json.detail
                })
            }
            addNewRepo(json?.id, adminCredential?.id, full_name);

        } catch (error) {
            console.log('error while getting credentails:', error)
        }
    };

    async function addNewRepo(conId, credId, name){
        try {
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
                await getAllExistingConnector();
                setTokenStatus(true)
            }
            // console.log(json)
        } catch (error) {
            console.log(error)
        }
    }

    async function getAllExistingConnector() {
        try {
            const currentConnector = allConnectors?.filter(item => item?.connector?.source === 'github');
                if(currentConnector?.length > 0){
                    setRepos(currentConnector)
                };
            // console.log(currentConnector);
            setLoading(false)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    async function validateGitHubAccessToken(accessToken) {
        const apiUrl = 'https://api.github.com';
        const userEndpoint = '/user';

        const headers = {
            Authorization: `Bearer ${accessToken}`,

        };

        try {
            const response = await fetch(apiUrl + userEndpoint, { headers });

            if (response.status === 200) {
                setTokenStatus(true);
                setTokenValue('');
                await getCredentials(accessToken)

            } else {
                toast({
                    variant: 'destructive',
                    title: 'Token validation failed.'
                })

            }
        } catch (error) {
            console.error(`Error validating GitHub access token: ${error.message}`);
        }
    };

    
    async function addRepo() {
        if (!tokenStatus) return toast({
            variant: 'destructive',
            title: 'Please provide a token for validation.'
        })
        if (repoName === '' || repoOwner === '') {
            return toast({
                title: 'Please provide some valid name and repo'
            })
        }
        try {
            await getConnectorId(repoOwner , repoName)
            setRepoName('');
            setRepoOwner('');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Repo not found'
            })

        }
    };

    async function handleRemoveToken(id){
        if(repos?.length > 0){
            return toast({
                variant:"destructive",
                description:'Must delete all github connector before delete credentials'
            })
        }
        try {
            const data = await fetch(currentUser?.role === 'admin' ? `/api/manage/admin/credential/${id}` : `/api/manage/credential/${id}`, {
                method:'DELETE'
            });
            if(data?.ok){
                await getAdminCredentials();
                setTokenValue('');
                return toast({
                    variant:"default",
                    description:'Credentials deleted !'
                })
            }
        } catch (error) {
            console.log(error)
            return toast({
                variant:"destructive",
                description:'Must delete all github connector before delete credentials'
            })
        }
    };
    
    useEffect(()=> {
        getAllExistingConnector();
    }, [allConnectors]);

    useEffect(()=> {
        getAdminCredentials();
    }, [])

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
                    <Image src={gitIcon} alt='github' className='w-5 h-5' />
                    <h1 className='font-[600] text-[20px] leading-7 tracking-[-0.5%] text-start'>Github PRs</h1>
                </div>
                <hr className='w-full' />
                <div className='self-start text-sm leading-5 flex flex-col gap-2 w-full'>
                    <h2 className='font-[600]  text-start'>Step 1: Provide your access token</h2>

                    {adminCredential !== null ? 
                        <span className='font-[400] inline-flex items-center'>
                            Existing Access Token: {adminCredential?.credential_json?.github_access_token} 
                            <Image src={trash} alt='remove' className='w-4 h-4 inline hover:cursor-pointer' onClick={() => handleRemoveToken(adminCredential?.id)} />
                        </span>
                        :
                        <div className='w-full space-y-2 text-start bg-slate-100 shadow-md p-4 rounded-md'>
                            <Input type='password' className='w-full' value={tokenValue} placeholder='Github Access Token' onChange={(e) => setTokenValue(e.target.value)} />
                            <Button onClick={() => { validateGitHubAccessToken(tokenValue); }}>Add</Button>
                        </div>
                    }

                </div>
                {
                tokenStatus && <>
                <div className='self-start text-sm leading-5 flex flex-col gap-2'>
                    <h2 className='font-[600]  text-start'>Step 2: Which repositories do you want to make searchable?</h2>
                    <span className='font-[400]'>We pull the latest Pull Requests from each Repository listed below every <span className='font-[600]'>10</span> minutes</span>
                </div>

                <div className='w-full self-start p-5 border rounded-lg bg-slate-100 shadow-md'>
                    <div className='text-start flex flex-col gap-4'>
                        <h2 className='font-[500] text-[16px] leading-6 text-[#0F172A]'>Connect to a New Repository</h2>
                        <Input placeholder='Repository Owner' type='text' value={repoOwner} onChange={(e) => setRepoOwner(e.target.value)} />
                        <Input placeholder='Repository Name' type='text' value={repoName} onChange={(e) => setRepoName(e.target.value)} />
                        <Button className='w-20' onClick={() => {
                            addRepo()
                        }}>Connect</Button>
                    </div>
                </div>
                </>
                }

                <Table className='w-full text-sm'>
                    <TableHeader className='p-2 w-full'>
                        <TableRow className='border-b p-2 hover:bg-transparent'>
                            <TableHead className="text-left p-2">Repository</TableHead>
                            <TableHead className='text-center'>Status</TableHead>
                            <TableHead className='text-center'>Credential</TableHead>
                            <TableHead className="text-center">Remove</TableHead>
                        </TableRow>
                    </TableHeader>
                    {loading && <TableRow><TableCell colSpan={3} className='w-full text-start p-2'>Loading...</TableCell></TableRow>}
                    <TableBody className='w-full'>
                        {repos.map((item) => {
                            
                            return (
                                <TableRow className='border-b hover:cursor-pointer w-full' key={item.cc_pair_id}>
                                    <TableCell className="font-medium w-[80%] text-left p-2 py-3 text-ellipsis break-all text-emphasis overflow-hidden">{item?.name}</TableCell>
                                    <TableCell className=''>
                                    <div className={`flex justify-center items-center gap-1 ${statusBackGround(item)} p-1 rounded-full `}>
                                        
                                            {`${!item?.connector?.disabled ? item?.latest_index_attempt?.status || 'Processsing' : 'Disabled'}`}
                                        </div>
                                    </TableCell>
                                    <TableCell className=''>{item?.credential?.credential_json?.github_access_token}</TableCell>
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

export default GitPrs