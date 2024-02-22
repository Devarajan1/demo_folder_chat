'use client'
import React, { useEffect, useState } from 'react'
import { Input } from '../../../components/ui/input'
import { Label } from "../../../components/ui/label"
import { Button } from "../../../components/ui/button"
import Google from "../../../public/assets/google.svg"
import Image from "next/image";
import eye_icon from '../../../public/assets/eye_icon.svg'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { requestEmailVerification } from "../../lib";
import { basicLogin } from "../../../lib/user";
import { useAtom } from 'jotai'
import { darkModeAtom } from '../../store'

const Login= ( { shouldVerify } ) => {


    const [disabled, setDisabled] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [darkMode, setDarkMode] = useAtom(darkModeAtom);
    const [errorMsg, setErrorMsg] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter()

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

    useEffect(() => {
        if (email !== '' && email.split('@').length > 1 && password != '') {
            setDisabled(false)
        } else {
            setDisabled(true)
        }
    }, [email, password]);


    const Sign = async () => {
        const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/
        if(!emailRegex.test(email)){
            setError("Incorrect email address")
            return null
        }
        localStorage.removeItem('lastFolderId')
        if (!disabled) {
            let isSignup = false
            const loginResponse = await basicLogin(email, password)
            if (loginResponse?.ok) {
                if (isSignup && shouldVerify) {
                    await requestEmailVerification(email);
                    router.push("/auth/waiting-on-verification");
                } else {
                    router.push("/workspace");
                }
            }
            else {
                const errorDetail = (await loginResponse.json()).detail;
                if (errorDetail === "LOGIN_BAD_CREDENTIALS") {
                    setError("Invalid email or password");
                    return null
                }
                setError("Unknown error")
            }
        }
    }
    return (

        <div className={`h-full w-full box-border flex justify-center items-center ${darkMode ? 'bg-[#EFF5F5] text-black' : 'bg-[#115E59] text-white'}`}>
            <div className={`flex flex-col h-full w-[22rem] gap-3 justify-center items-center box-border ${darkMode ? '' : 'text-white'} px-5 md:px-0`}>
                <h1 className='text-5xl space-x-0 w-full text-center font-[800] leading-[48px] tracking-[1.2%] mb-8'>Sign In</h1>
                <div className='w-full flex flex-col gap-3 text-sm font-inter'>
                    <div>
                        <Label htmlFor="email" className='text-sm font-[500] leading-[20px]'>Email Address</Label>
                        <Input type='email' id="email" placeholder='Enter Your Email' className='text-black mt-2 bg-white font-[400] leading-[20px]' onChange={(e) => { setEmail(e.target.value); setErrorMsg(false) }} />
                    </div>
                    <div className='relative'>
                        <Label htmlFor="password" className='text-sm font-[500] leading-[20px]'>Password</Label>
                        <Input type={'password'} id="password" value={password} placeholder='Password' className='text-black mt-2 font-[400]' onChange={(e) => { setPassword(e.target.value); setErrorMsg(false) }} />

                        {password !== '' && <button className="absolute top-12 right-2 transform -translate-y-1/2 px-2 py-1" onClick={() => showPassword('password')}>
                            <Image src={eye_icon} alt='show-password' title='Show Password' />
                        </button>}

                    </div>
                    <p className='tracking-tight text-xs text-red-400 -mt-1'>{error}</p>
                </div>


                <Button variant="outline" className={`w-full text-sm font-[400] text-white bg-[#14B8A6] border-[#14B8A6] leading-[24px] flex items-center justify-center ${disabled ? 'opacity-5' : ''}`} disabled={disabled}
                    onClick={() => Sign()}>Login</Button>

                <hr className='border border-[#CBD5E1] w-full' />

                {/* <Button variant="outline" className='w-full text-black border border-[#CBD5E1] rounded-[6px] leading-[20px] flex items-center justify-center gap-1' onClick={googleSignIn}><Image src={Google} alt="google" className='w-7 h-7' /><span className='font-[700] text-sm'>Continue With Google</span></Button> */}

                <div className='w-full text-sm opacity-75 text-center'>Don&apos;t have an account &#63; <Link href={'/auth/signup'} className='font-[500] hover:underline '>Sign Up</Link></div>
               {/* <Link href={'/auth/reset'} className='w-full text-sm opacity-75 text-center hover:underline'>Forgot your password &#63;</Link> */}
            </div>

        </div>

    )
}

export default Login;