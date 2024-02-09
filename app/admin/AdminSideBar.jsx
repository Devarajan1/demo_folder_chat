'use client'
import { Key, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

function AdminSideBar() {
  const router = useRouter()
  const options = [
  {
    id: "users",
    title: "Users",
    href: '/admin/users',
    icon: Users
  },
  {
    id: "openai",
    title: "OpenAI",
    href: '/admin/openai',
    icon: Key
  }
  ]
  return (
    <div className='w-full border min-h-full flex flex-col opacity-70'>
      {options?.map(item => {
        return (
          <Link href={item?.href} key={item?.id} className='flex items-center gap-2 hover:cursor-pointer p-4 hover:bg-gray-100 rounded-sm text-[16px] leading-5 font-[500]'>
            <item.icon size={'20'} />
            {item?.title}
          </Link>
        )
      })}

      <div className='flex items-center gap-2 hover:cursor-pointer p-4 hover:bg-gray-100 rounded-sm text-[16px] leading-5 font-[500]' onClick={() => window.history.back()}>
        <ArrowLeft size={'20'} />
        Go Back
      </div>
    </div>
  )
}

export default AdminSideBar