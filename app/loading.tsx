import React from 'react'
import Image from 'next/image'
function Loading() {
      
  return (
    <main className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        
            <div className="w-full max-w-lg mx-auto">
  <Image 
    src={"/logos/book.png"} 
    alt='Loading image' 
    width={203} 
    height={203} 
    className='animate-pulse w-full max-[460px]:px-12 h-auto'
  />
</div>
        
      </div>
    </main>
  )
}

export default Loading