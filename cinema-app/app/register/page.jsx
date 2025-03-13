import * as React from "react"
import RegisterForm from "@/components/auth/RegisterForm"

function register () {
    return (
        <div className={ "flex h-screen justify-center items-center flex-col gap-2 relative " }>
            <RegisterForm/>
        </div>
    )
}

export default register