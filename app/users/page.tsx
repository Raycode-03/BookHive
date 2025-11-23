"use server"
import React from 'react'
import { auth } from '../api/auth/[...nextauth]/auth'
import { redirect } from 'next/navigation'
// import Posts from "@/components/users/posts"
// import Newpost from '@/components/users/newpost'
async function page() {
    const session = await auth();
    const user= session?.user;
    if (!session?.user ) {
      redirect("/login")
    }
   if(session?.user){

              return(
                <div className='px-7 py-4'>
                  
                </div>
              )
  }
  redirect("/login")
}

export default page
