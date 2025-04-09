import React from 'react'

const Addmembers = () => {
  return (
    <div className='text-black'>
        <div className='grid gap-5 grid-cols-2 text-lg'>
            <input placeholder='Họ tên' type = 'text' className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'/>
            <input placeholder='Số điện thoại' type = 'text' className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'/>
            <input placeholder='Địa chỉ' type = 'text' className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'/>
            <input type = 'date' className='border-2 w-[90%] pl-3 pr-3 pt-2 pb-2 border-slate-400 rounded-md h-12'/>

            <select className='border-2 w-[90%] h-12 pt-2 pb-2 border-slate-400 rounded-md placeholder:text-gray'>
                <option>Gói 1 tháng</option>
                <option>Gói 3 tháng</option>
            </select>

            <input type='file'></input>

            <div className='w-1/4'>
                <img src={'https://cdn.pixabay.com/photo/2018/04/18/18/56/user-3331256_1280.png'} className='w-full h-full rounded-full'/>
            </div>

            <div className='p-3 border-2 w-28 text-lg h-14 text-center bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>Đăng ký</div>
        </div>
    </div>
  )
}

export default Addmembers