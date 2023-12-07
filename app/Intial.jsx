'use client'
import React, {useEffect} from 'react'
import Image from 'next/image'
import LogoW from "../public/assets/Logo-W.svg";
import Logo from "../public/assets/Logo.svg"
import { useAtom } from 'jotai';
import { darkModeAtom, isPostSignUpCompleteAtom, isPostUserCompleteAtom, sessionAtom } from './store';
import { IoSunnySharp, IoSunnyOutline } from "react-icons/io5";
import Link from 'next/link';
import { Button } from '../components/ui/button';
import supabase from '../config/supabse';
import { useRouter } from 'next/navigation';

const Intial = ({ children }) => {

  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const [userSession, setUserSession] = useAtom(sessionAtom);
  const [isPostOtpComplete, setPostSignupComplete] = useAtom(isPostSignUpCompleteAtom);
  const [isPostUserComplete ,setPostUserComplete] = useAtom(isPostUserCompleteAtom);
  const [isPostPassComplete ,setPostPassComplete] = useAtom(isPostUserCompleteAtom);
  const router = useRouter();

  async function signOut(){
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error)
    } else {
      setUserSession(null);
      setPostSignupComplete(false);
      setPostUserComplete(false);
      router.push('/login')
    }
};

async function getSess() {
  await supabase.auth.getSession().then(({ data: { session } }) => {
    if(session){
      // console.log(session)
      setUserSession(session);
    }
    // router.push('/signup');
    // console.log('home page', session)
  });
};

useEffect(()=> {
  getSess();
}, [])



// useEffect(() => {
  // console.log(session)
// }, [])

return (
  <div className={`flex font-Inter justify-center items-center w-full h-screen box-border bg-[#115E59] flex-col gap-10 text-white text-4xl ${darkMode ? 'bg-[#EFF5F5] text-black' : 'bg-[#115E59]'}`}>
    <Link href={'/'}><Image src={darkMode ? Logo : LogoW} alt='logo' className='absolute self-start align-top top-3 left-2' /></Link>
    {darkMode ? <IoSunnySharp className='absolute float-right top-5 right-5' color='#115E59' size={'2rem'} onClick={() => setDarkMode(false)} /> : <IoSunnyOutline className='absolute float-right top-5 right-5' color='white' size={'2rem'} onClick={() => setDarkMode(true)} />}

    {userSession && <Button className='absolute float-right top-5 right-16 bg-[#14B8A6] border-[#14B8A6] leading-[24px] hover:bg-[#EFF5F5] hover:text-[#14B8A6]' onClick={signOut}>Logout</Button>}

    {children}
  </div>
)
}

export default Intial