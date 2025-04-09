import React from 'react'
import CircleIcon from '@mui/icons-material/Circle';
const Membercard = () => {
  return (
    <div className='bg-white rounded-lg p-3 cursor-pointer hover:bg-gray-400 hover:text-white transition-colors duration-300 ease-in-out'>  
                        <div className='w-28 h-28 flex justify-center relative items-center border-2 p-1 mx-auto rounded-full'>
                            <img className='w-full h-full rounded-full' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMHgQ1Y-K5E-Fnf8LVBpKONJGhE97LZGX6rQ&s' alt='profile pic'/>
                            <CircleIcon className='absolute top-0 left-0' sx={{color: 'greenyellow'}}/>
                        </div>
                        <div className='mx-auto mt-5 text-center text-xl font-semibold font-mono'>
                                {'Phúc Hải'}
                        </div>
                        <div className='mx-auto mt-2 text-center text-l'>SĐT: {"0372441331"}</div>
                        <div className='mx-auto mt-2 text-center text-l'>Ngày hết hạn: {"30-4-2025"}</div>
                    </div> 
  )
}

export default Membercard
