'use client'
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import threeDot from '../../../public/assets/more-horizontal.svg'
import { useAtom } from 'jotai'
import { sessionAtom, isPostSignUpCompleteAtom, isPostUserCompleteAtom, folderIdAtom } from '../../store';
import { useRouter } from 'next/navigation';
import { sidebarOptions } from '../../../config/constants';
import { Dialog, DialogTrigger, DialogContent } from '../../../components/ui/dialog';
import { Setting } from '../(settings)'
import { ChevronDown, Check, LogOut } from 'lucide-react';
import { getCurrentUser } from '../../../lib/user';
import { Button } from '../../../components/ui/button';
import { Workspace } from '../(common)';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../../../components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../components/ui/popover"
import { cn } from '../../../lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation'
import Invite from '../../admin/Invite';

const Account = () => {
    const [userSession, setUserSession] = useAtom(sessionAtom);
    const [isPostOtpComplete, setPostSignupComplete] = useAtom(isPostSignUpCompleteAtom);
    const [isPostUserComplete, setPostUserComplete] = useAtom(isPostUserCompleteAtom);
    const [open, setOpen] = useState(false);
    const [openWork, setOpenWork] = useState(false)
    const [item, setItem] = useState('profile')
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const [workSpace, setWorkSpace] = useState(null);
    const [currentUser, setCurrentUser] = useState({});
    const [value, setValue] = useState('')
    const router = useRouter();
    const { workspaceid } = useParams()
    const [workspaces, setWorkSpaces] = useState([])

    async function fetchCurrentUser() {
        const user = await getCurrentUser();
        setCurrentUser(user)
    };

    async function getWorkSpace() {
        const res = await fetch('/api/workspace/admin/list-workspace');
        const json = await res.json()

        if (json?.data?.length > 0) {
            const currentWorkSpace = json?.data?.filter(workspace => workspace.id == workspaceid);
            if (currentWorkSpace.length > 0) {
                setValue(currentWorkSpace[0])
            } else {
                setValue(json?.data[0])
            }
            setWorkSpaces(json?.data)
        } else {
            setValue('')
        }

    }

    useEffect(() => {
        getWorkSpace()
        fetchCurrentUser();
    }, [workspaceid])
    return (
        workspaces?.length > 0 ?
            <div className='w-full '>
                <Popover open={open} onOpenChange={setOpen} className='w-full h-40 overflow-y-scroll'>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                        >
                            {value
                                ? workspaces.find((workspace) => workspace?.name === value?.name)?.name
                                : "Select workspace..."}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2 space-y-2">
                        
                        <Dialog>
                            <DialogTrigger asChild >
                            <div className='text-center text-white text-sm font-[400] flex justify-center items-center rounded-md shadow-sm hover:cursor-pointer h-8 w-full bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75'>Add an user</div>
                            </DialogTrigger>
                            <DialogContent>
                                <Invite />
                            </DialogContent>
                        </Dialog>
                        <Command>
                            <CommandInput placeholder="Search workspace..." className="h-9" />
                            <CommandEmpty>No workspace found.</CommandEmpty>
                            <CommandGroup>
                                {workspaces?.map((workspace) => (
                                    <Link href={`/workspace/${workspace?.id}/chat/new`} key={workspace.id} className='hover:cursor-pointer' onClick={()=> setFolderId(null)}>
                                        <CommandItem
                                            className='hover:cursor-pointer'
                                            value={workspace.name}
                                            onSelect={(currentValue) => {
                                                setValue(workspace)
                                                setOpen(false)
                                            }}
                                        >
                                            {workspace.name}
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    value?.name === workspace?.name ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    </Link>
                                ))}
                            </CommandGroup>
                        </Command>
                        <Workspace openMenu={openWork} setOpenMenu={setOpenWork} showBtn={true} />
                    </PopoverContent>

                </Popover>
            </div> : <Workspace openMenu={openWork} setOpenMenu={setOpenWork} showBtn={true} />

    )
}

export default Account