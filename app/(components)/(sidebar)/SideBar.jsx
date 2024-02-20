'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image';
import { AddWorkspace, NewFolder, FolderCard } from './index'
import { useAtom } from 'jotai';
import { folderAtom, showAdvanceAtom, folderIdAtom, currentSessionUserAtom, folderAddedAtom, workAddedAtom, workSpacesAtom } from '../../store';
import rightArrow from '../../../public/assets/secondary icon.svg';
import { LogOut, Settings } from 'lucide-react';
import AdvanceMenu from '../workspace/[workspaceid]/advance/(component)/AdvanceMenu'
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '../../../lib/user';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";


const SideBar = () => {


    const [folder, setFolder] = useAtom(folderAtom);
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);
    const [open, setOpen] = useState(false);
    const [item, setItem] = useState('profile')
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [folderAdded, setFolderAdded] = useAtom(folderAddedAtom);
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    // const [workSpaces, setUserWorkSpaces] = useState([])
    const [workSpaceAdded, setWorkSpaceAdded] = useAtom(workAddedAtom);
    const [workSpaces, setUserWorkSpaces] = useAtom(workSpacesAtom);
    const router = useRouter()
    const { workspaceid } = useParams()

    async function fetchCurrentUser() {
        const user = await getCurrentUser();
        setCurrentUser(user)
        await getWorkSpace(user);
        await getFolders()
    };


    async function getWorkSpace(user) {
        const url = user?.role === "admin" ? '/api/workspace/admin/list-workspace' : '/api/workspace/list-workspace-public'
        const res = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });
        if (res.ok) {
            const json = await res.json()
            setUserWorkSpaces(json.data)
        } else {
            setUserWorkSpaces([])
        }
    }
    async function getFolders() {
        //await fetchCurrentUser();
        if (!workspaceid) {
            return null
        }
        const res = await fetch(`/api/workspace/list-folder?workspace_id=${workspaceid}`);
        if (res.ok) {
            const json = await res.json()

            if (json.data.length > 0) {
                setFolder(json?.data);
                if(localStorage.getItem('lastFolderId')){
                    setFolderId(localStorage.getItem('lastFolderId'))
                }else{
                    setFolderId(json?.data[json?.data.length - 1]?.id)
                }
                
            } else {
                setFolder([])
                setFolderId(null)
            }
        } else {
            setFolder([])
        }
    }

    useEffect(() => {
        getFolders()

    }, [folderAdded, workspaceid, workSpaceAdded]);

    useEffect(() => {
        fetchCurrentUser()
    }, [workSpaceAdded])

    return (
        <div className='w-full bg-[#EFF5F5] flex flex-col py-[19px] px-1 gap-4 font-Inter relative min-h-screen'>

            {currentUser?.email &&
                <div className='flex flex-col gap-2 w-full p-2'>
                    {/* <div className='flex flex-col gap-2 w-full'>

                    {sidebarOptions.map(option => {
                        return (
                            option.id !== 'settings' ?
                                <div key={option.id} className='inline-flex gap-2 hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md' onClick={() => { setItem(option.id); setOpen(true); }}>
                                    <Image src={option.icon} alt={option.title} />
                                    <span className='text-sm leading-5 font-[500]'>{option.title}</span>
                                </div>
                                :
                                <Dialog open={open} onOpenChange={() => { setOpen(!open); setItem(option.id) }} key={option.id}>

                                    <DialogTrigger asChild className='self-start'>

                                        <div key={option.title} className='inline-flex gap-2 hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md' >
                                            <Image src={option.icon} alt={option.title} />
                                            <span className='text-sm leading-5 font-[500]'>{option.title}</span>
                                        </div>

                                    </DialogTrigger>
                                    <Setting item={item} setItem={setItem} />
                                </Dialog>
                        )
                    })}
                </div> */}
                    <Accordion type="single" defaultValue='profile' collapsible className='w-full'>
                        <AccordionItem value="profile" className='p-2 gap-2 flex flex-col w-full'>
                            <AccordionTrigger className='flex-row-reverse justify-between items-center gap-2'>
                                <div className='flex w-full justify-between'>
                                    <h1 className='font-[600] text-sm leading-5 mr-10 break-all w-full'>{currentUser?.email}</h1>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className='flex flex-col justify-center gap-2 items-start h-fit bg-[#EFF5F5] rounded-lg p-2'>

                                {currentUser?.role === 'admin' && <Link href={`/admin/users`} className='flex gap-2 items-center hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md'>
                                    <Settings className='w-4 h-4' color='#14B8A6' /><span className='font-[500] leading-5 text-sm'>Admin Settings</span>

                                </Link>}

                                <div className='flex items-center gap-2 hover:cursor-pointer hover:bg-[#d9dada] w-full p-2 rounded-md' onClick={async () => {
                                    const res = await logout();
                                    if (res.ok) {
                                        setFolderId(null);
                                        setCurrentUser(null)
                                        router.push('/auth/login')
                                    }
                                }}>
                                    <LogOut className='w-4 h-4' color='#14B8A6' /><span className='font-[500] leading-5 text-sm hover:cursor-pointer'>Log Out</span>
                                    {/* <Image src={threeDot} alt={'options'} className='w-4 h-4 hover:cursor-pointer' /> */}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                </div>}

            <AddWorkspace />
            {!showAdvance ?
                workSpaces?.length > 0 && <Link href={`/workspace/${workspaceid}/advance`} className='w-full flex justify-between items-center bg-[#DEEAEA] p-3 rounded-md hover:cursor-pointer' onClick={() => { setShowAdvance(!showAdvance) }}>
                    <h1 className='font-[600] text-sm leading-5'>Advanced</h1>
                    <Image src={rightArrow} alt='open' />
                </Link>
                :
                <div className='w-full h-fit bg-[#14B8A6] text-[#FFFFFF] rounded-lg shadow-md'>
                    <AdvanceMenu />
                </div>}


            {folder?.length > 0 && <div className='flex flex-col gap-2 w-full border rounded-sm px-2 py-1 shadow-sm'>
                <h1 className='text-sm font-[600] leading-5 w-full p-1'>Folders</h1>
                {folder?.map((fol) => {
                    return (
                        <FolderCard key={fol.id} fol={fol} />
                    )
                })}
            </div>}

            {workSpaces?.length > 0 && <NewFolder setFolderAdded={setFolderAdded} openMenu={false} />}

        </div>

    )
}

export default SideBar