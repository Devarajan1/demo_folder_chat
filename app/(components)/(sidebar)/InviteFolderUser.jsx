'use client'
import React, { useEffect, useState, useRef } from 'react'
import { getAllUsers, getCurrentUser } from '../../../lib/user';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { UserRoundPlus, Users, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useParams } from 'next/navigation';
import { useToast } from '../../../components/ui/use-toast';
import { currentSessionUserAtom } from '../../store'

import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';

import { useAtom } from 'jotai';

function InviteFolderUser({ folder_id, popoverSetOpen }) {


    const [open, setOpen] = useState(false)
    const [users, setUsers] = useState([]);
    const [loader, setLoader] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [selectedUser, setSelectedUser] = useState([]);
    const [existingUser, setExistingUser] = useState([]);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [showList, setShowList] = useState(false)
    const { workspaceid } = useParams();
    const { toast } = useToast();
    const containerRef = useRef(null);

    async function fetchWorkspaceUsers() {
        const apiURL = currentUser?.role === 'admin' ? `/api/workspace/admin/list-workspace-user?workspace_id=${workspaceid}`: `/api/workspace/list-workspace-user-public?workspace_id=${workspaceid}`
        const response = await fetch(apiURL);
        if (response.ok) {
            const json = await response.json();
            // console.log(json.data, 'current wk users')
            // setExistingUser(json?.data)
            // setUsers(json?.data)
            return json?.data
        }
    }
    async function fetchFolderUsersList(){

        const wkUserList = await fetchWorkspaceUsers()
        const response = await fetch(`/api/workspace/list-folder-user?folder_id=${folder_id}`);

        if(response.ok){
            const json = await response.json();
            if(json?.data?.length > 0){
                setExistingUser(json?.data);
                let fillterdUsers = [];
                for (let i = 0; i < wkUserList.length; i++) {
                    let flag = false
                    for (let j = 0; j < json?.data?.length; j++) {

                        if (wkUserList[i]?.user?.user_id === json?.data[j].user?.user_id) {
                            flag = true
                        }
                    };
                    if (!flag) {
                        fillterdUsers.push(wkUserList[i])
                    }
                };

                setUsers(fillterdUsers)
            }else{
                setUsers(wkUserList)
                setExistingUser([])
            }
        }
    }

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setShowList(false);
        }
      };


    async function fetchAllUsers() {
        setLoader(true)
        try {
            
            const wkUsers = await fetchWorkspaceUsers();
            setLoader(false)
            if (res?.length > 0) {

                const nonAdminUsers = res.filter(user => user?.role !== 'admin');

                let fillterdUsers = [];


                for (let i = 0; i < nonAdminUsers.length; i++) {
                    let flag = false
                    for (let j = 0; j < wkUsers.length; j++) {

                        if (wkUsers[j]?.user?.user_id === nonAdminUsers[i].id) {
                            flag = true
                        }
                    };
                    if (!flag) {
                        fillterdUsers.push(nonAdminUsers[i])
                    }
                };

                // setUsers(fillterdUsers)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoader(false)
        }
    };

    
    function handleRemoveUser(userObj) {
        setSelectedUser(selectedUser.filter(user => user?.user?.email !== userObj?.user?.email));
        setUsers((prev => [...prev, userObj]));

    };

    function handleAddUser(userObj) {
        let isExist = selectedUser.filter(user => user?.user?.email === userObj?.user?.email);
        if (isExist.length === 0) {
            setSelectedUser((prev) => [...prev, userObj]);
            setUsers(users.filter(user => user?.user?.email !== userObj?.user?.email))
            setUserEmail('')
        }
    };

    async function inviteFolderUserFunction(userData) {
        
        try {
            const userIDS = userData.map(user => user?.user?.user_id);
           

            const response = await fetch(`/api/workspace/create-folder-user-bulk`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "folder_id": folder_id,
                    "user_ids": userIDS,
                    "is_admin": false
                })
            });
            if (response?.ok) {
                setOpen(false)
                popoverSetOpen(false)
                return toast({
                    variant: 'default',
                    title: "User added!"
                });
            } else {
                console.log(response)
            }
        } catch (error) {
            console.log(error)
            return toast({
                variant: 'default',
                title: "Fail to add user!"
            });
        }
    };

    async function removerUserFromFolder(id) {
        try {
            const response = await fetch(`/api/workspace/delete-folder-user/folder-user-id/${id}/folder-id/${folder_id}`, {
                credentials: 'include',
                method: 'DELETE',
            });
            if (response.ok) {
                // console.log(response)
                toast({
                    variant: 'default',
                    title: "User removed"
                });
                // await fetchCurrentUser();
                await fetchWorkspaceUsers();
                await fetchFolderUsersList()
                // await fetchAllUsers();

            }
        } catch (error) {
            console.log(error)
        }
    };
    

    useEffect(() => {
        // fetchCurrentUser();
        fetchWorkspaceUsers()
        fetchFolderUsersList();

    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="inline-flex p-2 items-center font-[400] text-sm leading-5 hover:bg-[#F1F5F9] rounded-md hover:cursor-pointer">
                    <UserRoundPlus className="mr-2 h-4 w-4" />
                    <span>Share</span>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader className='mb-2'>
                    <DialogTitle>
                        Add User
                    </DialogTitle>
                </DialogHeader>
                <div className='font-Inter p-2 min-h-[50vh] space-y-1 flex flex-col justify-between box-border'>
            <div className='relative'>
                <div className='w-full flex flex-row flex-wrap gap-0 border rounded-md  items-center p-1'>
                    <Input
                        
                        type='text'
                        value={userEmail}
                        placeholder='write user email here'
                        onClick={(e) => setShowList(true)}
                        // onMouseLeave={(e) => setShowList(false)}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className='border-none  max-w-full h-full w-[100%] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    {selectedUser.length > 0 &&
                        selectedUser?.map(user => <p key={user?.id} className='py-1 px-2 border rounded-md hover:cursor-pointer text-sm leading-5 font-[400] flex justify-between items-center gap-1 bg-slate-100 mx-1'>{user?.user?.email} <X size={10} className='' onClick={() => handleRemoveUser(user)} /></p>)
                    }
                </div>

                {(showList && users?.length > 0) ?
                    <div ref={containerRef}  className='border rounded-md max-h-[25vh] overflow-y-scroll no-scrollbar bg-white w-full z-20 absolute'>
                        {users?.map(user => user?.user?.email?.includes(userEmail) && <p key={user?.id} className='p-2 hover:cursor-pointer hover:bg-slate-100 border-b text-sm leading-5 font-[400]  ' onClick={(() => handleAddUser(user))}>{user?.user?.email}</p>)}
                    </div> :
                    loader && <div className='w-full h-32 flex justify-center items-center'>
                        <p className='animate-pulse font-[500] text-sm leading-8'>Loading...</p>
                    </div>
                }

                {/* {showList && <div className='w-full  border rounded-md max-h-[25vh] overflow-y-scroll no-scrollbar'>
                    {users?.length > 0 ? users?.map(user => user?.email.includes(userEmail) && <p key={user?.id} className='absolute bg-white w-full z-20 p-2 hover:cursor-pointer hover:bg-slate-100 border-b text-sm leading-5 font-[400]' onClick={(() => handleAddUser(user))}>{user?.email}</p>):
                    <p className='absolute p-2 hover:cursor-pointer hover:bg-slate-100 border-b text-sm leading-5 font-[400] z-20 bg-white w-full'>No user found</p>
                    }
                </div>}

                {loader && <div className='w-full h-32 flex justify-center items-center'>
                    <p className='animate-pulse font-[500] text-sm leading-8'>Loading...</p>
                </div>} */}

                <div className='fixed w-[90%] p-2'>
                    {!loader && existingUser?.map(user => <div key={user?.id} className='w-full p-2 hover:cursor-pointer border-b text-sm leading-5 font-[400] flex justify-between items-center'>

                        <p>{user?.user?.email}</p>
                        <p className='max-w-fit p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-500 font-[600]' onClick={() => removerUserFromFolder(user?.id)}>Remove</p>

                    </div>)}
                </div>
            </div>
            <Button disabled={selectedUser?.length === 0} className='w-[25%] m-auto z-50' onClick={() => inviteFolderUserFunction(selectedUser)}>Invite User</Button>
        </div>
            </DialogContent>
        </Dialog>
    )
}

export default InviteFolderUser