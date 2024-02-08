'use client'
import React, { useEffect, useState } from 'react'
import { getAllUsers } from '../../lib/user';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Loader, X, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

function Invite() {
    const [users, setUsers] = useState([]);
    const [loader, setLoader] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [selectedUser, setSelectedUser] = useState([]);
    const [existingUser, setExistingUser] = useState([]);
    
    async function getAllWorkspaceUsers() {
        try {
            const res = await getAllUsers();
            if(res?.length > 0){
                setUsers(res)
            }
        } catch (error) {
            console.log(error)
        }finally{
            setLoader(false)
        }
    };

    function handleRemoveUser(userObj){
        setSelectedUser(selectedUser.filter(user => user?.email !== userObj?.email));
        setUsers((prev => [...prev, userObj]));
        
    };

    function handleAddUser(userObj){
        let isExist = selectedUser.filter(user => user.email === userObj?.email);
        if(isExist.length === 0){
            
            setSelectedUser((prev) => [...prev, userObj]);
            setUsers(users.filter(user => user.email !== userObj?.email))
            setUserEmail('')
        }
    };
    
    useEffect(() => {
        getAllWorkspaceUsers();
    }, []);

    return (
        <div className='font-Inter p-2 min-h-[50vh] space-y-1 relative'>
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
                    onChange={(e) => setUserEmail(e.target.value)} 
                    className='border-none  max-w-full h-full w-[100%] focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
                />
                {selectedUser.length > 0 && 
                    selectedUser?.map(user => <p key={user?.id} className='py-1 px-2 border rounded-md hover:cursor-pointer text-sm leading-5 font-[400] flex justify-between items-center gap-1 bg-slate-100 mx-1'>{user?.email} <X size={10} className='' onClick={()=> handleRemoveUser(user)}/></p>)
                }
            </div>
            {/* {selectedUser.length > 0 && <div className='w-full gap-1 p-1 border flex flex-wrap rounded-md max-h-[30vh] overflow-y-scroll no-scrollbar '>
                {selectedUser?.map(user => <p key={user?.id} className='py-1 px-2 border rounded-md hover:cursor-pointer text-sm leading-5 font-[400] relative bg-slate-100'>{user?.email} <XCircle size={10} className='absolute top-0 right-0' onClick={()=> handleRemoveUser(user)}/></p>)}
            </div>} */}


            {(users?.length > 0) ? <div className='w-full border rounded-md max-h-[30vh] overflow-y-scroll no-scrollbar '>
                {users?.map(user => user?.email.includes(userEmail) && <p key={user?.id} className='p-2 hover:cursor-pointer hover:bg-slate-100 border-b text-sm leading-5 font-[400]' onClick={(()=> handleAddUser(user))}>{user?.email}</p>)}
            </div>:
            loader && <div className='w-full h-32 flex justify-center items-center'>
                <p className='animate-pulse font-[500] text-sm leading-8'>fetching data...</p>
            </div>
            }
            <Button disabled={selectedUser.length === 0} className='bottom-0 absolute right-[40%]'>Invite User</Button>
        </div>
    )
}

export default Invite