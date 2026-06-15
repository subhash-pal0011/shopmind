"use client";
import Image from "next/image";
import { IoSearchOutline } from "react-icons/io5";
import { FiPhoneCall } from "react-icons/fi";
import { LuCircleUserRound, LuShoppingCart } from "react-icons/lu";
import { HiMiniBars3 } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { PiSignIn } from "react-icons/pi";
import { PiSignOutFill } from "react-icons/pi";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { signOut } from "next-auth/react";
import { createPortal } from "react-dom";
import { GoHome } from "react-icons/go";
import { LuLayoutGrid } from "react-icons/lu";
import { MdOutlineShoppingBag } from "react-icons/md";
import { RiListUnordered } from "react-icons/ri";


const Navbar = ({ user }) => {

  const [menuShow, setMenuShow] = useState(false);
  const [sideBar, setSideBar] = useState(false);

  const menuItems = [
    {
      icon: <LuCircleUserRound size={15} />,
      label: "Profile",
    },
    {
      icon: <PiSignIn />,
      label: "Sign In",
    },
    {
      icon: <PiSignOutFill color="red" />,
      label: "Sign Out",
      danger: true,
    },
  ];

  const element = sideBar ? createPortal(
    <AnimatePresence>
      <motion.div
        key="menu"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        className="w-60 inset-0 z-50 border h-screen fixed bg-gray-100 p-5 rounded-tr-xl rounded-br-xl space-y-5">


        <motion.div initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-1.5 items-center">
          <GoHome />
          <p>Home</p>
        </motion.div>

        <motion.div initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-1.5 items-center">
          <LuLayoutGrid />
          <p>Cotegories</p>
        </motion.div>

        <motion.div initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-1.5 items-center">
          <MdOutlineShoppingBag />
          <p>Shop</p>
        </motion.div>

        <motion.div initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex gap-1.5 items-center">
          <RiListUnordered />
          <p>Order</p>
        </motion.div>

        <motion.div initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex gap-1.5 items-center">
          <LuCircleUserRound />
          <p>Profile</p>
        </motion.div>

        <motion.div initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex gap-1.5 items-center">
          <PiSignIn />
          <p>Login</p>
        </motion.div>

        <motion.div onClick={() => signOut()}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex gap-1.5 items-center text-red-500">
          <PiSignIn />
          <p>Sign Out</p>
        </motion.div>

      </motion.div>
    </AnimatePresence>,
    document.body
  ) : null

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md px-4 md:px-8 py-4 md:py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-around">

        {/* Logo */}
        <div>
          <Image
            src="/logo-2.png"
            alt="ShopMind Logo"
            width={250}
            height={50}
            priority
          />
        </div>

        <div className="flex md:gap-20">
          {/* Desktop Menu */}

          {user.userRole === "user" &&
            <div className="hidden lg:flex items-center gap-8 text-sm">
              {["Home", "Categories", "Shop", "Other"].map((item) => (
                <p
                  key={item}
                  className="
                cursor-pointer
                text-gray-700
                transition-all
                duration-300
                ease-in-out
                hover:text-blue-600
                hover:-translate-y-1
                after:absolute 
                after:left-0
                after:-bottom-1
                after:h-0.5
                after:w-0
                after:bg-blue-600
                after:transition-all
                after:duration-300
                hover:after:w-full
                "
                >
                  {item}
                </p>
              ))}
            </div>
          }

          {/* Icons */}
          {user.userRole === "user" ?
            <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-8">

              <IoSearchOutline
                size={20}
                className="w-5 h-5 sm:w-7 sm:h-6 md:w-7 md:h-6 lg:w-10 lg:h-6 cursor-pointer hover:scale-110 hover:text-blue-500 transition-all duration-200 text-gray-600"
              />

              <FiPhoneCall
                size={17}
                className="w-5 h-4 sm:w-7 sm:h-5 md:w-7 md:h-6 lg:w-7 lg:h-5 cursor-pointer hover:scale-110 hover:text-blue-500 transition-all text-gray-600 duration-200"
              />

              <LuShoppingCart
                className="w-5 h-4 sm:w-7 sm:h-5 md:w-7 md:h-6 lg:w-10 lg:h-5 cursor-pointer hover:scale-110 hover:text-blue-500 transition-all duration-200 text-gray-600"
              />

              <div className="relative">
                <LuCircleUserRound
                  onClick={() => setMenuShow(!menuShow)}
                  size={17}
                  className="w-5 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6 lg:w-7 lg:h-5 cursor-pointer hover:scale-110 hover:text-blue-500 transition-all duration-200 text-gray-600 hidden lg:flex"
                />

                <AnimatePresence>
                  {menuShow && (
                    <motion.div initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, ease: "ease-in" }}
                      transition={{ duration: 0.20, ease: "easeOut" }}
                      className="absolute right-0 top-10 w-36 bg-white shadow-lg rounded-md border py-2 z-50 p-1">

                      {menuItems.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            if (item.label === "Sign Out") {
                              signOut();
                            }
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer transition-all flex items-center gap-1 rounded"
                        >
                          {item.icon}

                          <p
                            className={`text-sm ${item.label === "Sign Out" ? "text-red-500" : ""
                              }`}
                          >
                            {item.label}
                          </p>
                        </div>
                      ))}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {sideBar ? (
                <RxCross2
                  onClick={() => setSideBar(prev => !prev)}
                  className="w-6 h-5 sm:w-6 sm:h-5 md:w-7 md:h-6 lg:hidden cursor-pointer text-red-500"
                />
              ) : (
                <HiMiniBars3
                  onClick={() => setSideBar(prev => !prev)}
                  className="w-6 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6 text-gray-600 lg:hidden cursor-pointer"
                />
              )}
            </div>
            :
            <div className="flex gap-8">
              <FiPhoneCall
                size={30}
                className="w-4 h-5 sm:w-7 sm:h-5 md:w-5 md:h-5 lg:w-7 lg:h-5 cursor-pointer hover:scale-110 hover:text-blue-500 transition-all text-gray-600 duration-200"
              />

              <div className="relative">
                <LuCircleUserRound
                  onClick={() => setMenuShow(!menuShow)}
                  size={30}
                  className="w-4 h-5 sm:w-7 sm:h-5 md:w-5 md:h-5 lg:w-7 lg:h-5 cursor-pointer hover:scale-110 hover:text-blue-500 transition-all duration-200 text-gray-600"
                />
                <AnimatePresence>
                  {menuShow && (
                    <motion.div initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10, ease: "ease-in" }}
                      transition={{ duration: 0.20, ease: "easeOut" }}
                      className="absolute right-0 top-10 w-36 bg-white shadow-lg rounded-md border py-2 z-50 p-1">

                      {menuItems.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            if (item.label === "Sign Out") {
                              signOut();
                            }
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer transition-all flex items-center gap-1 rounded"
                        >
                          {item.icon}

                          <p
                            className={`text-sm ${item.label === "Sign Out" ? "text-red-500" : ""
                              }`}
                          >
                            {item.label}
                          </p>
                        </div>
                      ))}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          }

        </div>
      </div>
      {element}
    </nav>
  );
};

export default Navbar;