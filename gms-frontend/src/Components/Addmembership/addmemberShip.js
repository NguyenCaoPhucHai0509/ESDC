import React from 'react'

const AddmemberShip = () => {
  return (
    <div>
        <div className='flex flex-wrap gap-5 items-center justify-center'>
          {/* block for membership details */}
          <div className='text-lg bg-slate-900 text-white border-2 pl-2 pr-2 flex-col gap-3 justify-between pt-1 pb-1 rounded-xl font-semibold hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition duration-300'>
            <div>Gói 1 tháng</div>
            <div>350.000VNĐ</div>
          </div>

          {/* block for membership details */}
          <div className='text-lg bg-slate-900 text-white border-2 pl-2 pr-2 flex-col gap-3 justify-between pt-1 pb-1 rounded-xl font-semibold hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition duration-300'>
            <div>Gói 3 tháng</div>
            <div>950.000VNĐ</div>
          </div>

          {/* block for membership details */}
          <div className='text-lg bg-slate-900 text-white border-2 pl-2 pr-2 flex-col gap-3 justify-between pt-1 pb-1 rounded-xl font-semibold hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition duration-300'>
            <div>Gói 6 tháng</div>
            <div>1.800.000VNĐ</div>
          </div>

          {/* block for membership details */}
          <div className='text-lg bg-slate-900 text-white border-2 pl-2 pr-2 flex-col gap-3 justify-between pt-1 pb-1 rounded-xl font-semibold hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition duration-300'>
            <div>Gói 1 năm</div>
            <div>3.500.000VNĐ</div>
          </div>

        </div>

        <hr className='mt-10 mb-10'/>
        <div className='flex gap-10'>
          <input className='border-2 rounded-lg text-lg w-1/3 h-1/2 p-2' type='number' placeholder='Số tháng'/>
          <input className='border-2 rounded-lg text-lg w-1/3 h-1/2 p-2' type='number' placeholder='Giá'/>
          <div className='bg-slate-900 text-lg text-white border-2 p-1 w-auto mt-0 rounded-xl cursor-pointer hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'>Thêm +</div>
        </div>
    </div>
  )
}

export default AddmemberShip