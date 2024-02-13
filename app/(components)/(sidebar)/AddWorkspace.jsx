'use client'
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import threeDot from '../../../public/assets/more-horizontal.svg'
import { useAtom } from 'jotai';
import { isPostSignUpCompleteAtom, isPostUserCompleteAtom, folderIdAtom, currentSessionUserAtom, folderAddedAtom,workAddedAtom } from '../../store';
import { useRouter } from 'next/navigation';
import { sidebarOptions } from '../../../config/constants';
import { Dialog, DialogTrigger, DialogContent } from '../../../components/ui/dialog';
import { Setting } from '../(settings)'
import { ChevronDown, Check, UserPlus, ChevronUp, MoreHorizontal, Trash2, Folder } from 'lucide-react';
import { getCurrentUser } from '../../../lib/user';
import { Button } from '../../../components/ui/button';
import WorkspaceDialog from './WorkspaceDialog'
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../components/ui/alert-dialog';
import { useToast } from '../../../components/ui/use-toast';
import NewFolder from './NewFolder';

const AddWorkspace = () => {

  const [isPostOtpComplete, setPostSignupComplete] = useAtom(isPostSignUpCompleteAtom);
  const [isPostUserComplete, setPostUserComplete] = useAtom(isPostUserCompleteAtom);
  const [open, setOpen] = useState(false);
  const [folderOpen, setFolderOpen] = useState(false)
  const [openWork, setOpenWork] = useState(false)
  const [item, setItem] = useState('profile')
  const [folderId, setFolderId] = useAtom(folderIdAtom);
  const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
  const [value, setValue] = useState('');
  const [folderAdded, setFolderAdded] = useAtom(folderAddedAtom);
  const router = useRouter();
  const { workspaceid } = useParams()
  const [workspaces, setWorkSpaces] = useState([]);
  const [popOpen, setPopOpen] = useState(false);
  const [workAdded, setWorkAdded] = useAtom(workAddedAtom)
  const { toast } = useToast();


  async function getWorkSpace(user) {
    // console.log(user)
    const url = user?.role === "admin" ? '/api/workspace/admin/list-workspace' : '/api/workspace/list-workspace-public'
    const res = await fetch(url, {
      method:'GET',
      credentials:'include'
  });
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

  };

  async function deleteWorkSpace(id){
    console.log(id);
    // setPopOpen(false);
    // return null
    
    try {
      const response = await fetch(`/api/workspace/admin/delete-workspace/${id}`, {
        credentials:'include',
        method:'DELETE'
      });
      if(response?.ok){
        toast({
          variant: 'default',
          title: "Workspace deleted !"
        });
        setPopOpen(false)
        setWorkAdded(!workAdded)
      }
    } catch (error) {
      console.log(error)
    }
  }
  async function fetchCurrentUser(){
    const user = await getCurrentUser();
    setCurrentUser(user)
    await getWorkSpace(user)
  };
  useEffect(() => {
    fetchCurrentUser();
    
  }, [workspaceid]);

  return (
    <div className='w-full border rounded-sm px-2 py-1'>
      {workspaces?.length > 0 ? (
        <>
          <h1 className='text-sm font-[600] leading-5 w-full p-1'>Workspaces</h1>
          <Popover open={open} onOpenChange={setOpen} className='w-full h-40 overflow-y-scroll'>
            <div className='flex items-center'>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {value
                    ? workspaces.find(workspace => workspace?.name === value?.name)?.name
                    : "Select workspace..."}
                  <div className='flex'>
                    {
                      !open ? 
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> 
                        :
                        <ChevronUp className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    }

                  </div>

                </Button>
              </PopoverTrigger>
              <Popover open={popOpen} onOpenChange={setPopOpen}>
                <PopoverTrigger asChild className='w-fit'>
                  <MoreHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:cursor-pointer"/>
                </PopoverTrigger>
                <PopoverContent className='w-fit p-1 flex flex-col'>
                  <div className="flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" onClick={()=> setFolderOpen(true)}>
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Add New Folder</span>
                    
                  </div>
                  {folderOpen && <NewFolder setFolderAdded={setFolderAdded} openMenu={folderOpen} setOpenMenu={setFolderOpen} />}
                  {currentUser?.role === 'admin' &&
                  <>
                  <Dialog>
                  <DialogTrigger asChild>
                    
                    <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" >
                        <UserPlus className="mr-2 h-4 w-4" />
                        <span>Invite Users</span>
                      </div>
                  </DialogTrigger>
                  <DialogContent>
                    <Invite />
                  </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete Workspace</span>
                      </div>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will delete all folders and files inside this workspace.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={()=> setPopOpen(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={()=> deleteWorkSpace(workspaceid)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>

                    </AlertDialogContent>
                  </AlertDialog>
                  </>
                  }

                </PopoverContent>
              </Popover>
            </div>

            <PopoverContent className="w-full p-2 space-y-2">
              
              <Command>
                <CommandInput placeholder="Search workspace..." className="h-9" />
                <CommandEmpty>No workspace found.</CommandEmpty>
                <CommandGroup>
                  {workspaces?.map(workspace => (
                    <Link href={`/workspace/${workspace?.id}/chat/new`} key={workspace.id} className='hover:cursor-pointer' onClick={() => setFolderId(null)}>
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
              {currentUser?.role === 'admin' && <WorkspaceDialog openMenu={openWork} setOpenMenu={setOpenWork} showBtn={true} setPopOpen={setOpen}/>}
            </PopoverContent>
          </Popover>
        </>) : currentUser?.role === 'admin' && <WorkspaceDialog openMenu={openWork} setOpenMenu={setOpenWork} showBtn={true} />}
    </div>

  )
}

export default AddWorkspace