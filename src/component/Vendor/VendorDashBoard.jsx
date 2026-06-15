"use client"
import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react";
import { HiMiniBars3 } from "react-icons/hi2";
import { LuLayoutGrid } from "react-icons/lu";
import { FaStore } from "react-icons/fa";
import { BsBag } from "react-icons/bs";
import { createPortal } from "react-dom";
import { RxCross2 } from "react-icons/rx";
import VendorDashboards from './VendorDashboards';
import Products from './Products';
import Orders from './Orders';



const VendorDashBoard = () => {
  const [active, setActive] = useState(1);
  const [sideBarShow, setSideBarShow] = useState(false);

  const bar = [
    { id: 1, name: "Dashboard", icon: <LuLayoutGrid /> },
    { id: 2, name: "Product", icon: <FaStore /> },
    { id: 3, name: "Orders", icon: <BsBag /> },
  ];

  const sideBar = sideBarShow ? createPortal(
    <AnimatePresence>

      <motion.div
        key="menu"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="max-w-50 inset-0 z-50 border h-screen fixed bg-gray-100 p-3.5 rounded-tr-xl rounded-br-xl space-y-4 py-5">

        <div className="flex items-center justify-between">
          <p>Menue</p>
          <RxCross2 className="cursor-pointer" onClick={() => setSideBarShow(prev => !prev)} />
        </div>

        {bar.map((item) => (
          <motion.div key={item.id} onClick={() => setActive(item.id)}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`flex gap-1.5 items-center border py-3 p-1.5 rounded bg-white shadow-xl cursor-pointer ${active === item.id
              ? "scale-110 bg-blue-100 shadow-lg border transition-all duration-300 border-blue-400" :

              "hover:scale-105 bg-white transition"
              }`}>
            <span className="text-md text-blue-500">{item.icon}</span>
            <p className="font-medium text-gray-700 text-xs">{item.name}</p>
          </motion.div>
        ))}

      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null

  const renderPage = () => {
    switch (active) {
      case 1: return <VendorDashboards />
      case 2: return <Products />
      case 3: return <Orders />
    }
  }

  return (
    <div className='w-full min-h-screen bg-gray-100'>

      <div className="h-1"></div>

      <div className="flex flex-col md:flex-row w-full gap-2">
 
        {/* SIDEBAR FOR SMALL SCREEN */}
        {!sideBarShow && <AnimatePresence>
          <motion.div
            className="px-1.5 md:px-5 md:hidden "
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between border p-2 py-3 bg-gray-50 px-5">
              <h3 className="text-xs">Admin Panel</h3>
              <HiMiniBars3 className="cursor-pointer" onClick={() => setSideBarShow(prev => !prev)} />
            </div>
          </motion.div>
        </AnimatePresence>}

        {/* SIDEBAR FOR LG SCREEN */}
        <motion.div initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 w-60  h-screen p-4 px-4 hidden md:block">

          {bar.map((item) => (
            <div key={item.id}
              onClick={() => setActive(item.id)}

              className={`flex items-center gap-3 p-3 max-w-50 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition hover:scale-110 
                ${active === item.id
                  ? "scale-110 bg-blue-100 shadow-lg border transition-all duration-300 border-blue-400"
                  : "hover:scale-105 bg-white transition"
                }`}
            >
              <span className="text-md text-blue-500">{item.icon}</span>
              <p className="font-medium text-gray-700 text-xs">{item.name}</p>
            </div>
          ))}
        </motion.div>

        {/* RENDOR-PAGE-COMPONENT */}
        <motion.div className='bg-gray-100 h-screen shadow-[0_0.5px_10px_rgba(0,0,0,0.12)] p-5 w-full'
        initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {renderPage()}
        </motion.div>

      </div>
      {sideBar}
    </div>
  )
}

export default VendorDashBoard
