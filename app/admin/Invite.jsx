'use client'
import React, { useEffect, useState, useRef } from 'react'
import { getAllUsers, getCurrentUser } from '../../lib/user';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Users, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useParams } from 'next/navigation';
import { useToast } from '../../components/ui/use-toast';
import { currentSessionUserAtom } from '../store'

import { useAtom } from 'jotai';
function Invite() {
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

    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
          setShowList(false);
        }
      };

    // async function fetchCurrentUser() {
    //     setLoader(true)
    //     const user = await getCurrentUser();
    //     console.log(user, 'all users')
    //     setCurrentUser(user)
    // };

    async function fetchAllUsers() {
        setLoader(true)
        try {
            // await fetchCurrentUser()
            const wkUsers = await fetchWorkspaceUsers();
            const res = await getAllUsers();
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

                setUsers(fillterdUsers)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoader(false)
        }
    };

    async function fetchWorkspaceUsers() {
        const response = await fetch(`/api/workspace/admin/list-workspace-user?workspace_id=${workspaceid}`);
        if (response.ok) {
            const json = await response.json();
            // console.log(json.data, 'current wk users')
            setExistingUser(json?.data)
            return json?.data
        }
    }

    function handleRemoveUser(userObj) {
        setSelectedUser(selectedUser.filter(user => user?.email !== userObj?.email));
        setUsers((prev => [...prev, userObj]));

    };

    function handleAddUser(userObj) {
        let isExist = selectedUser.filter(user => user.email === userObj?.email);
        if (isExist.length === 0) {

            setSelectedUser((prev) => [...prev, userObj]);
            setUsers(users.filter(user => user.email !== userObj?.email))
            setUserEmail('')
        }
    };

    async function inviteWorkspaceUser(userData) {
        try {
            const userIDS = userData.map(user => user.id);

            const response = await fetch(`/api/workspace/admin/create-workspace-user-bulk`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "user_ids": userIDS,
                    "workspace_id": parseInt(workspaceid),
                    "role_id": 0,
                    "approved": true,
                    "is_admin": false
                })
            });
            if (response.ok) {
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

    async function removerUserFromWorkspace(id) {
        try {
            const response = await fetch(`/api/workspace/admin/delete-workspace-user/${id}`, {
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
                await fetchAllUsers();

            }
        } catch (error) {
            console.log(error)
        }
    };
    ;

    useEffect(() => {
        // fetchCurrentUser();

        fetchAllUsers();

    }, []);
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);


    return (
        <div className='font-Inter p-2 min-h-[50vh] space-y-1 flex flex-col justify-between box-border'>
            <div className='relative'>
                <Label
                    htmlFor='user-email'
                    className='font-[600] text-sm leading-5'>
                    Search User
                </Label>
                <div className='w-full flex flex-row flex-wrap gap-0 border rounded-md  items-center p-1'>
                    <Input
                        id='user-email'
                        type='text'
                        value={userEmail}
                        placeholder='write user email here'
                        onClick={(e) => setShowList(true)}
                        // onMouseLeave={(e) => setShowList(false)}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className='border-none  max-w-full h-full w-[100%] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    {selectedUser.length > 0 &&
                        selectedUser?.map(user => <p key={user?.id} className='py-1 px-2 border rounded-md hover:cursor-pointer text-sm leading-5 font-[400] flex justify-between items-center gap-1 bg-slate-100 mx-1'>{user?.email} <X size={10} className='' onClick={() => handleRemoveUser(user)} /></p>)
                    }
                </div>

                {(showList && users?.length > 0) ?
                    <div ref={containerRef}  className='border rounded-md max-h-[25vh] overflow-y-scroll no-scrollbar bg-white w-full z-20 absolute'>
                        {users?.map(user => user?.email.includes(userEmail) && <p key={user?.id} className='p-2 hover:cursor-pointer hover:bg-slate-100 border-b text-sm leading-5 font-[400]  ' onClick={(() => handleAddUser(user))}>{user?.email}</p>)}
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
                        <p className='max-w-fit p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-500 font-[600]' onClick={() => removerUserFromWorkspace(user?.id)}>Remove</p>

                    </div>)}
                </div>
            </div>
            <Button disabled={selectedUser.length === 0} className='w-[25%] m-auto z-50' onClick={() => inviteWorkspaceUser(selectedUser)}>Invite User</Button>
        </div>
    )
}

export default Invite