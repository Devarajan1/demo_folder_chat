'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '../../components/ui/input'
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import Google from "../../public/assets/google.svg"
import Image from "next/image";
import eye_icon from '../../public/assets/eye_icon.svg'
import supabase from '../../config/supabse'
import { useAtom } from 'jotai'
import { darkModeAtom, sessionAtom } from '../store';
import Link from 'next/link'

const Signup = () => {

  const [disabled, setDisabled] = useState(false);
  const [userInput, setUserInput] = useState({
    email:'',
    password:'',
    confirm_password:''
  });
  const [inputError, setInputError] = useState(false)

  const [darkMode] = useAtom(darkModeAtom);

  const [errorMsg, setErrorMsg] = useState(false);

  useEffect(() => {
    if (userInput.email !== '' && userInput.email.split('@').length > 1 && userInput.password != '' && userInput.confirm_password != '') {
      setDisabled(false)
      
    } else {
      setDisabled(true)
    }
  }, [userInput]);



  async function signUpFunction() {
    if(userInput.password !== userInput.confirm_password){
      setInputError('Password and confirm password does not match');
      return null
    }else{
      setInputError(false);
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userInput.email,
        password: userInput.password,
      });
      if (error) {
        setErrorMsg(error.message)
      }
      else {
        setErrorMsg('Check Your Email For Confirmation Mail')
      }
    } catch (error) {
      setErrorMsg(error.message)
      console.error('Error logging in:', error.message);
    }
  };



  async function googleSignIn() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
        redirectTo : 'http://localhost:3000/welcome'
      },
    });
    if (error) {
      setErrorMsg(error.message);
    } else {
      console.log(data)

    }
  };

  function showPassword(id) {
    var input = document.getElementById(id);
    if (input) {
        if (input.type === "text") {
            input.type = "password";
        } else {
            input.type = "text";
        }
    }
};



  function handleOnchange(e){
    setUserInput({
      ...userInput,
      [e.target.name] : e.target.value
    })
  };

  return (
    <div className={`flex flex-col w-[22rem] gap-3 justify-center items-center box-border ${darkMode ? '' : 'text-white'}`}>

      <h1 className='text-5xl w-full text-center font-[800] leading-[48px] tracking-[1.2%] mb-8'>Sign Up</h1>
      <p className='tracking-tight text-xs text-[#14B8A6]'>{errorMsg}</p>
      <div className='w-full flex flex-col gap-2 text-sm font-[500] leading-[20px]'>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input type='email' name='email' id="email" value={userInput.email} placeholder='Enter Your Email' className='text-black mt-2 bg-white font-[400] leading-[20px]' onChange={(e) => handleOnchange(e)} />
        </div>

        <div className='relative'>
          <Label htmlFor="password">Password</Label>
          <Input type='password' id="password" name='password' value={userInput.password} placeholder='Password' className='text-black mt-2 font-[400]' onChange={(e) => handleOnchange(e)} />

          {userInput.password !== '' && <button className="absolute top-12 right-2 transform -translate-y-1/2 px-2 py-1" onClick={() => showPassword('password')}>
            <Image src={eye_icon} alt='show-password' title='Show Password' />
          </button>}
        </div>

        <div className='relative'>
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input type='password' id="confirm_password" name='confirm_password' value={userInput.confirm_password} placeholder='Confirm Password' className='text-black mt-2 font-[400]' onChange={(e) => handleOnchange(e)} />

          {userInput.confirm_password !== '' && <button className="absolute top-12 right-2 transform -translate-y-1/2 px-2 py-1" onClick={() => showPassword('confirm_password')}>
            <Image src={eye_icon} alt='show-password' title='Show Password' />
          </button>}
          <p className='tracking-tight text-xs text-red-400 mt-1'>{inputError}</p>
        </div>
        


      </div>

      <Button variant="outline" className={`w-full text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px] flex items-center justify-center ${disabled ? 'opacity-5' : ''}`} disabled={disabled} onClick={signUpFunction}>Create new account</Button>

      <hr className='border border-[#CBD5E1] w-full' />

      <Button variant="outline" className='w-full text-black border border-[#CBD5E1] rounded-[6px] leading-[20px] flex items-center justify-center gap-1' onClick={googleSignIn}><Image src={Google} alt="google" className='w-7 h-7' /><span className='font-[700] text-sm'>Continue With Google</span></Button>

      <div className='w-full text-sm opacity-75 text-center'>Already have an account &#63; <Link href={'/login'} className='font-[500] hover:underline '>Sign In</Link></div>

    </div>
  )
}

export default Signup