


import { Header } from "../(components)/(common)"
import { darkModeAtom } from "../store";
import AdminSideBar from './AdminSideBar'

import {
    getAuthTypeMetadataSS,
    getCurrentUserSS,
} from "../../lib/userSS";
import { redirect } from "next/navigation";
export default async function AdminAuth({ children }) {
    
    const tasks = [getAuthTypeMetadataSS(), getCurrentUserSS()];

    // catch cases where the backend is completely unreachable here
    // without try / catch, will just raise an exception and the page
    // will not render
    let results = [null, null];
    try {
        results = await Promise.all(tasks);
    } catch (e) {
        console.log(`Some fetch failed for the main search page - ${e}`);
    }

    const authTypeMetadata = results[0];
    const user = results[1]

    const authDisabled = authTypeMetadata?.authType === "disabled";
    const requiresVerification = authTypeMetadata?.requiresVerification;

    if (!authDisabled) {
        if (!user) {
            return redirect("/auth/login");
        }
        if (user.role !== "admin") {
            return redirect("/chat/new");
        }
        if (!user.is_verified && requiresVerification) {
            return redirect("/auth/waiting-on-verification");
        }
    }

    return (
        <div className={`font-Inter h-screen w-full box-border sticky self-start top-0 flex flex-col`}>
            <Header showActions={false} />
            <div className="flex h-full">
                <div className="w-[20%]">
                    <AdminSideBar />
                </div>
                <div className="w-[80%]">
                    {children}
                </div>
            </div>
        </div>
    )
}