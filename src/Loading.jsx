import React from 'react'

const Loading = () => {
  return (
    <div className='w-full justify-center flex my-2'>
        <div className="flex gap-2">
        <div className="w-5 h-5 rounded-full animate-pulse bg-sky-800" />
        <div className="w-5 h-5 rounded-full animate-pulse bg-sky-800" />
        <div className="w-5 h-5 rounded-full animate-pulse bg-sky-800" />
    </div>

    </div>
  )
}

export default Loading