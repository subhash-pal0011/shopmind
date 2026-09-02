import React from 'react'
import Slider from './Slider'
import Categoreis from './Categoreis'
import ProductPage from './ProductPage'



const UserDashBoard = () => {
  return (
    <div className='py-1 bg-gray-200'>
      <Slider />
      <Categoreis />
      <ProductPage />
    </div>
  )
}

export default UserDashBoard
