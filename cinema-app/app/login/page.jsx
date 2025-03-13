import * as React from "react"
import { Input } from "@/components/ui/input"

function login () {
    return (
        <div className={ "flex h-screen justify-center items-center flex-col gap-2 relative " }>
            <label htmlFor="email" className="text-left" >Email</label>
            <Input className={ 'w-50'}/>
            <label htmlFor="password">Password</label>
            <Input className={ 'w-50'}/>
        </div>
    )
}

export default login