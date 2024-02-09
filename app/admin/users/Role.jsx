import React, { useState } from 'react'
import { useAtom } from 'jotai';
import { currentSessionUserAtom } from '../../store'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Command, CommandGroup, CommandItem } from "../../../components/ui/command"
import { Button } from '../../../components/ui/button';
import { ChevronDown, Check } from 'lucide-react';


const Role = ({ user, promoteToAdmin }) => {

    const [open, setOpen] = useState(false);
    const [currentUser, setCurrentUser] = useAtom(currentSessionUserAtom);
    const [value, setValue] = useState(user?.role)

    const dropDownOptions = [{
        id:'admin',
        title:'Admin'
    },
    {
        id:'basic',
        title:'User'
    }];


    return (
        <Popover open={open} onOpenChange={()=> {
            if(user.id !== currentUser?.id){
                setOpen(!open)
            }
        }} className='w-full h-40 overflow-y-scroll'>
            <PopoverTrigger asChild className='w-full'>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={`w-full justify-between ${user.id === currentUser?.id ? 'hover:cursor-not-allowed' : ''}`}
                >
                    {value === 'admin' ? 'Admin' : 'User'}
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
                                        setValue(currentValue)
                                        promoteToAdmin(currentValue, user)
                                        setOpen(false)
                                    }}
                                >
                                    {option?.title}
                                    <Check
                                        className={`ml-auto h-4 ${option?.id === value ? "opacity-100" : "opacity-0"}`}
                                    />
                                </CommandItem>
                            </div>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export default Role