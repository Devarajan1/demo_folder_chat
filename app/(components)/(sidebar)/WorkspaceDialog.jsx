'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { useParams  } from 'next/navigation';
import { useAtom } from 'jotai';
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { folderIdAtom, workAddedAtom } from '../../store';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../../lib/user';
import { currentSessionUserAtom } from '../../store';
import { useToast } from '../../../components/ui/use-toast';


const WorkspaceDialog = ({ openMenu, setOpenMenu, showBtn, setPopOpen }) => {
    
    const [inputError, setInputError] = useState(false);
    const [workAdded, setWorkAdded] = useAtom(workAddedAtom)
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [folderId, setFolderId] = useAtom(folderIdAtom);
    const { workspaceid } = useParams();
    const { toast } = useToast();

    const router = useRouter()

    const [userInput, setUserInput] = useState('');


    async function createWorkspace() {
        
        if (userInput?.name === '') {
            setInputError('Write some valid workspace name');
            return null
        }
        try {
            const res = await fetch('/api/workspace/admin/create-workspace', {
                method: 'POST',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    "name": userInput,
                    "created_by": currentUser?.id,
                    "is_active": true,
                    "domain":"NA"
                })
            });
            if (res.ok) {
                setOpenMenu(false);
                setFolderId(null);
                setWorkAdded(!workAdded)
                setPopOpen && setPopOpen(false)
                toast({
                    variant: 'default',
                    title: 'Workspace created successfully!'
                });
                router.push(`/workspace/${json?.data?.id}/chat/new`)
                
            }else{
                const json = await res.json()
                
                if(json?.detail){
                    setInputError('Contact your Admin to create a new workspace')
                }
            }
        } catch (error) {
            console.log(error)
        }
    };


    return (
        <Dialog open={openMenu} onOpenChange={() => {
            
            setPopOpen && setPopOpen(false)
            setOpenMenu(!openMenu)
            setInputError(false); 
            setUserInput('');
            
        }}>
            {showBtn && <DialogTrigger className='w-full'>
                <Button className='py-0 h-8 w-full bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75'>
                    New Workspace
                </Button>
            </DialogTrigger>}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='font-[600] text-[18px] leading-[18px] text-[#0F172A]'>Create New Workspace</DialogTitle>
                    <DialogDescription className='font-[400] text-[14px] leading-5'>
                        Workplace is where you & your team organize documents
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col items-start gap-4">
                        <Label htmlFor="name" className="font-[500] text-sm leading-5">
                            Workplace Name
                        </Label>
                        <Input
                            id="name"
                            placeholder='Type workplace name'
                            className="col-span-3"
                            value={userInput.name}
                            onChange={(e) => setUserInput(e.target.value)}
                            autoComplete='off'
                        />
                    </div>
                    
                    <p className='tracking-tight text-xs text-red-400 -mt-1'>{inputError}</p>
                </div>
                <DialogFooter>
                    <Button variant={'outline'} type="submit" className='text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px]' onClick={createWorkspace}>Create Workspace</Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    )
}

export default WorkspaceDialog