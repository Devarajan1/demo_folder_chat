'use client'

import { useAtom } from "jotai";
import { Header } from "../(components)/(common)"
import { darkModeAtom } from "../store";


export default function RootLayout({ children }) {
    const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  return (
    <>
    <div className={`flex font-Inter items-center h-fit w-full box-border flex-col gap-1 ${darkMode ? 'bg-[#EFF5F5] text-black' : 'bg-[#115E59] text-white'} p-2`}>
        <Header showActions={false} />
    </div>
    <div className="w-full h-full min-h-screen flex justify-center px-14 py-10 text-sm text-justify">
        { children }
    </div>
    </>
  )
}
