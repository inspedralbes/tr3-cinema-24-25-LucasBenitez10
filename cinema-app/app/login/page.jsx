import * as React from "react"
import LoginForm from "@/components/auth/LoginForm"

function login () {
    return (
        <div className={ "flex h-screen justify-center items-center flex-col gap-2 relative " }>
            <LoginForm/>
        </div>
    )
}

export default login