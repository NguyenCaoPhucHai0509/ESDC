import React from 'react'
import Login from '../../Components/Login/Login'



const Home = () => {
  return (
    <div className='w-full h-[100vh]'>
        <div className='border-2 border-slate-800 bg-slate-800 text-white p-5 font-semibold text-xl'>
            Welcome!
        </div>
        <Login/>
    </div>
  )
}

export default Home