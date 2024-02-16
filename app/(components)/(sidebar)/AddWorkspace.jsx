'use client'
import React, { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import threeDot from '../../../public/assets/more-horizontal.svg'
import { useAtom } from 'jotai';
import { isPostSignUpCompleteAtom, isPostUserCompleteAtom, folderIdAtom, currentSessionUserAtom, folderAddedAtom, workAddedAtom } from '../../store';
import { useRouter } from 'next/navigation';
import { sidebarOptions } from '../../../config/constants';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Setting } from '../(settings)'
import { ChevronDown, Check, UserPlus, ChevronUp, MoreHorizontal, Trash2, Folder, Briefcase, Edit } from 'lucide-react';
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
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

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
  const [workAdded, setWorkAdded] = useAtom(workAddedAtom);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workNewName, setWorkNewName] = useState('')
  const { toast } = useToast();


  async function getWorkSpace(user) {
    // console.log(user)
    const url = user?.role === "admin" ? '/api/workspace/admin/list-workspace' : '/api/workspace/list-workspace-public'
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include'
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
      setWorkSpaces([])
    }

  };

  async function updateWorkName(newName, workID) {
    if(newName === ''){
      return toast({
        variant:'destructive',
        title:'Provide valid name'
      })
    }
    try {
        
        // const url = currentUser?.role === "admin" ? '/api/workspace/admin/update-folder' :'/api/workspace/update-folder'
        const response = await fetch(`/api/workspace/admin/update-workspace`, {
            credentials: 'include',
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "workspace_id": parseInt(workID),
              "name": newName,
              "is_active": true,
              "domain": "NA"
          })
        });
        setWorkNewName('')
        if (response.ok) {
            setWorkAdded(!workAdded)
            setDialogOpen(false);
            setPopOpen(false);
           
            return toast({
                variant: 'default',
                title: 'Wokspace name updated successfully!'
            });
        }else{
            const error = await response.json()
            if(error?.detail){
                setPopOpen(false);
                return toast({
                    variant: 'destructive',
                    title: error?.detail
                });
            }
        }
    } catch (error) {
        
        console.log(error, detail, 'dddd')
    }

    return null
};

  async function deleteWorkSpace(id) {
    
    try {
      const response = await fetch(`/api/workspace/admin/delete-workspace/${id}`, {
        credentials: 'include',
        method: 'DELETE'
      });
      if (response?.ok) {
        toast({
          variant: 'default',
          title: "Workspace deleted !"
        });
        setPopOpen(false)
        setWorkAdded(!workAdded)
        router.push('/workspace')
      }
    } catch (error) {
      console.log(error)
    }
  }
  async function fetchCurrentUser() {
    const user = await getCurrentUser();
    setCurrentUser(user)
    await getWorkSpace(user)
  };
  useEffect(() => {
    fetchCurrentUser();

  }, [workspaceid, workAdded]);

  return (
    workspaces?.length > 0 && <div className='w-full border rounded-sm px-2 py-1'>
      {workspaces?.length > 0 ? 
      (<>
          <h1 className='text-sm font-[600] leading-5 w-full p-1'>Workspaces</h1>
          <Popover open={open} onOpenChange={setOpen} className='w-full h-40 overflow-y-scroll no-scrollbar'>
            <div className='flex items-center'>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  onClick={()=> localStorage.removeItem('lastFolderId')}
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
                  <MoreHorizontal className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:cursor-pointer" />
                </PopoverTrigger>
                <PopoverContent className='w-fit p-1 flex flex-col'>
                  <div className="flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" onClick={() => setFolderOpen(true)}>
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Add New Folder</span>
                  </div>
                  {folderOpen && <NewFolder setFolderAdded={setFolderAdded} openMenu={folderOpen} setOpenMenu={setFolderOpen} setPopOpen={setPopOpen}/>}
                  {currentUser?.role === 'admin' &&
                    <>
                    <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" onClick={()=> setOpenWork(true)}>
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>Add New Workspace</span>
                      </div>
                      <WorkspaceDialog openMenu={openWork} setOpenMenu={setOpenWork} showBtn={false} setPopOpen={setPopOpen} />
                      <Invite setPopOpen={setPopOpen}/>
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer" >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader className='mb-2'>
                                        <DialogTitle>
                                            Update Name
                                        </DialogTitle>
                                    </DialogHeader>
                                    <Label htmlFor='work-name'>New Name</Label>
                                    <Input
                                        id='work-name'
                                        type='text'
                                        placeholder='new name'
                                        value={workNewName}
                                        autoComplete='off'
                                        className='text-black'
                                        onChange={(e) => setWorkNewName(e.target.value)}
                                    />


                                    <DialogFooter className={cn('w-full')}>
                                        <Button variant={'outline'} className={cn('bg-[#14B8A6] text-[#ffffff] m-auto')} onClick={() => updateWorkName(workNewName)}>Update</Button>
                                    </DialogFooter>

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
                            <AlertDialogCancel onClick={() => setPopOpen(false)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction className='bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-75' onClick={() => deleteWorkSpace(workspaceid)}>Continue</AlertDialogAction>
                          </AlertDialogFooter>

                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  }

                </PopoverContent>
              </Popover>
            </div>

            <PopoverContent className="w-full p-2 space-y-2 max-h-52 overflow-y-scroll">

              <Command>
                <CommandInput placeholder="Search workspace..." className="h-9" />
                <CommandEmpty>No workspace found.</CommandEmpty>
                <CommandGroup>
                  {workspaces?.map(workspace => (
                    <div key={workspace.id} className='flex justify-center items-center hover:cursor-pointer'>
                      <Link href={`/workspace/${workspace?.id}/chat/new`} className='hover:cursor-pointer flex flex-row justify-between w-full items-center px-2' onClick={() => setFolderId(null)}>
                      <CommandItem
                        className='flex justify-between w-full hover:cursor-pointer'
                        value={workspace.name}
                        onSelect={(currentValue) => {
                          setValue(workspace)
                          setOpen(false)
                        }}
                      >
                        {workspace.name}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 z-50",
                            value?.name === workspace?.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                      
                    </Link>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild onClick={()=> setWorkNewName(workspace.name)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader className='mb-2'>
                                        <DialogTitle>
                                            Update Name
                                        </DialogTitle>
                                    </DialogHeader>
                                    <Label htmlFor='work-name'>New Name</Label>
                                    <Input
                                        id='work-name'
                                        type='text'
                                        placeholder='new name'
                                        value={workNewName}
                                        autoComplete='off'
                                        className='text-black'
                                        onChange={(e) => setWorkNewName(e.target.value)}
                                    />


                                    <DialogFooter className={cn('w-full')}>
                                        <Button variant={'outline'} className={cn('bg-[#14B8A6] text-[#ffffff] m-auto')} onClick={() => updateWorkName(workNewName, workspace?.id)}>Update</Button>
                                    </DialogFooter>

                                </DialogContent>
                      </Dialog>
                  
                    </div>
                    
                  ))}
                </CommandGroup>
              </Command>
              
            </PopoverContent>
          </Popover>
        </>) : currentUser?.role === 'admin' && <WorkspaceDialog openMenu={openWork} setOpenMenu={setOpenWork} showBtn={true} />}
    </div>

  )
}

export default AddWorkspace