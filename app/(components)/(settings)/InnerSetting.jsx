import React from 'react'

const InnerSetting = () => {
  return (
    <div className='w-full py-5 font-Inter flex flex-col'>
            <div className='flex flex-col gap-6'>
                <h2 className='font-[600] text-[18px] leading-7'>Privacy</h2>
                <div className='w-full flex justify-between items-center'>
                    
                    <div className='font-[400] text-sm leading-6'>
                        <p className='opacity-[50%]'>Cookie settings</p>
                        <p className='font-[500]'>Customize cookies. See Cookie Notice for details.</p>
                    </div>
                    
                </div>
                <div className='w-full flex justify-between items-center'>
                    <div className='font-[400] text-sm leading-6'>
                        <p className='opacity-[50%]'>Show my view history</p>
                        <p className='font-[500]'>People with edit or full access will be able to see when you&apos;ve viewed a page. Learn more. </p>
                    </div>
                    
                </div>
                
            </div>
        </div>
  )
}

export default InnerSetting