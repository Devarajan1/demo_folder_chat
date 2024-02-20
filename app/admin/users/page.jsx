'use client'
import React, { useEffect, useState } from 'react'
import { Loader2, Users, UserRoundX, ChevronDown, Check, User } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { useToast } from '../../../components/ui/use-toast';
import { deleteUser, getAllUsers, getCurrentUser, promoteUser } from '../../../lib/user';
import { useAtom } from 'jotai';
import { currentSessionUserAtom } from '../../store';
import Image from 'next/image';
import threeDot from '../../../public/assets/more-horizontal.svg';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "../../../components/ui/command"
import Role from './Role'
function Admin() {

    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [loader, setLoader] = useState(true);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('')
    const dropDownOptions = [{
            id:'admin',
            title:'Admin'
        },
        {
            id:'basic',
            title:'User'
        }]
    async function getUsers() {
        try {
            const res = await getAllUsers()
            setLoader(false)
            setUsers(res)
        } catch (error) {
            console.log(error)
        }
    };

    async function dltUser(user) {
        if (user?.id === currentUser?.id) {
            return null
        }
        setLoader(true)
        try {
            const res = await deleteUser(user?.email);
            if (res.ok) {
                await getUsers()
                setLoader(false)
                return toast({
                    variant: 'default',
                    title: "User deleted."
                });
            } else {
                return toast({
                    variant: 'destructive',
                    title: "Something went wrong"
                });
            }

        } catch (error) {
            console.log(error)
        }
    }

    async function promoteToAdmin(currentValue, user) {
        if(user?.id === currentUser?.id){
            alert('admin call')
            return null
        }
        if(currentValue === user?.role){
            return null
            alert(user.role);
        }
        
        setLoader(true)
        const res = await promoteUser(user);
        if (res.ok) {
            setLoader(false)
            return toast({
                variant: 'default',
                title: `${user?.role === 'admin' ? 'Demoted to user' : "Promoted to admin"}`
            });
        } else {
            return toast({
                variant: 'destructive',
                title: "Something went wrong"
            });
        }
    };

    async function fetchCurrentUser() {
        const user = await getCurrentUser();
        setCurrentUser(user)
    };

    useEffect(() => {
        getUsers();
        fetchCurrentUser();
    }, []);


    return (
        <div className='w-full font-Inter p-4'>
            {loader && <div className='w-[80%] justify-center h-screen flex items-center z-50 bg-gray-50 opacity-40 self-start select-none fixed'>
                <Loader2 className='animate-spin m-auto' />
            </div>}
            <h2 className='text-2xl text-strong font-bold flex gap-x-2 items-center '><Users size={25}/> Manage Users</h2>
            <hr className='my-5' />
            <Table >
                <TableHeader className='p-2 w-full'>
                    <TableRow className='border-none p-2 hover:bg-transparent'>
                        <TableHead className="text-left">Email</TableHead>
                        {/* <TableHead className='text-center'>Role</TableHead> */}
                        <TableHead className='text-center'>Role</TableHead>
                        <TableHead className="text-center"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className='border-y'>
                    {users?.length > 0 && users?.map(user =>
                        <TableRow key={user?.id} className='hover:bg-transparent'>
                            <TableCell >
                                <div className='flex gap-2 items-center'>
                                    <User size={20}/>
                                    <p className='font-[500] text-sm leading-5'>{user?.email}</p>
                                </div>
                            </TableCell>
                            {/* <TableCell className='text-center font-[400] leading-5 text-sm'>
                                {user?.role === "admin" ? "Admin" : "User"}
                            </TableCell > */}
                            <TableCell className='text-center'>
                                <div className='w-full'>
                                    {/* <Popover className='w-full h-40 overflow-y-scroll'>
                                        <PopoverTrigger asChild >
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-full justify-between"
                                            >
                                                {user?.role === 'admin' ? 'Admin' : 'User'}
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[16rem] p-1 space-y-2">
                                            <Command className="p-1">
                                                <CommandGroup >
                                                    {dropDownOptions?.map(option => (
                                                        <div key={option?.id} className='hover:cursor-pointer flex gap-5 hover:bg-slate-100 rounded' >
                                                            <CommandItem
                                                                className='hover:cursor-pointer w-full'
                                                                value={option?.id}
                                                                onSelect={(currentValue) => {
                                                                    promoteToAdmin(currentValue, user)
                                                                }}
                                                            >
                                                                {option?.title}
                                                                <Check
                                                                    className={`ml-auto h-4 ${option?.id === user?.role ? "opacity-100" : "opacity-0"}`}
                                                                />
                                                            </CommandItem>
                                                        </div>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover> */}
                                    <Role user={user} promoteToAdmin={promoteToAdmin}/>
                                </div>
                            </TableCell>
                            <TableCell >
                                <div className='justify-center items-center w-full flex'>

                                    <Popover >
                                        <PopoverTrigger asChild>
                                            <Image src={threeDot} alt='option' width={35} height={35} className='rounded-sm hover:bg-slate-100 hover:cursor-pointer' />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-2">
                                            <div className={`w-full flex justify-center items-center p-2 gap-2 hover:bg-slate-100 rounded ${currentUser?.id === user?.id ? 'hover:cursor-not-allowed' : 'hover:cursor-pointer'}`} onClick={() => dltUser(user)}>
                                                <UserRoundX size={16} color='#d44c47' />
                                                <p className='text-sm font-[400] leading-5 text-[#d44c47]'>Remove user</p>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                </div>
                            </TableCell>
                        </TableRow>
                    )}

                </TableBody>
            </Table>
        </div>
    )
}

export default Admin