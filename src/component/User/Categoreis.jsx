
"use client";
import { motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { LuArrowRight } from "react-icons/lu";
import { GiClothes } from "react-icons/gi";
import { FaShoePrints, FaBook, FaBasketballBall } from "react-icons/fa";
import { MdOutlineElectricalServices, MdPhoneAndroid } from "react-icons/md";
import { IoSparkles } from "react-icons/io5";
import { GiKitchenKnives } from "react-icons/gi";


const Categoreis = () => {
       const scrollRef = useRef(null);
       const [hover, setHover] = useState(false);

       const categories = [
              { id: 1, name: "Fashion", icon: <GiClothes /> },
              { id: 2, name: "Shoes", icon: <FaShoePrints /> },
              { id: 3, name: "Electronics", icon: <MdOutlineElectricalServices /> },
              { id: 4, name: "Digital", icon: <MdPhoneAndroid /> },
              { id: 5, name: "Beauty", icon: <IoSparkles /> },
              { id: 6, name: "Home & Kitchen", icon: <GiKitchenKnives /> },
              { id: 7, name: "Books", icon: <FaBook /> },
              { id: 8, name: "Sports", icon: <FaBasketballBall /> },
       ];

       const leftScroll = () => {

              scrollRef.current.scrollBy({
                     left: -210,
                     behavior: "smooth"
              })
       }
       const rightScroll = () => {
              scrollRef.current.scrollBy({
                     left: 210,
                     behavior: "smooth"
              })
       }
       useEffect(() => {
              if (hover) return;
              const interval = setInterval(() => {

                     if (!scrollRef.current) return;

                     const container = scrollRef.current;

                     container.scrollBy({
                            left: 210,
                            behavior: "smooth",
                     });

                     if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {

                            setTimeout(() => {
                                   container.scrollTo({
                                          left: 0,
                                          behavior: "smooth",
                                   });
                            }, 500);
                     }
              }, 3000);

              return () => clearInterval(interval);
       }, [hover]);

       return (
              <section className="w-full p-5 bg-white">
                     <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-5 relative py-">

                            <h2 className="text-2xl md:text-xl font-bold text-center text-gray-800">
                                   Shop by Category
                            </h2>

                            <div
                                   ref={scrollRef}
                                   onMouseEnter={() => setHover(true)}
                                   onMouseLeave={() => setHover(false)}
                                   className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
                            >
                                   {categories.map((item) => (
                                          <motion.div
                                                 key={item.id}
                                                 className="min-w-45 bg-white rounded-2xl shadow-md hover:shadow-xl cursor-pointer p-4 flex flex-col items-center"
                                          >
                                                 <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gray-100">
                                                        <span className="text-5xl text-blue-500">
                                                               {item.icon}
                                                        </span>
                                                 </div>

                                                 <p className="mt-4 text-center font-semibold text-gray-800">
                                                        {item.name}
                                                 </p>
                                          </motion.div>
                                   ))}
                                   <div className="flex gap-3 w-full absolute justify-between top-30">
                                          <button onClick={() => leftScroll()} className="p-2 rounded-full bg-white shadow hover:scale-105 transition cursor-pointer">
                                                 <GoArrowLeft />
                                          </button>

                                          <button onClick={() => rightScroll()} className="p-2 rounded-full bg-white shadow hover:scale-105 transition cursor-pointer">
                                                 <LuArrowRight />
                                          </button>
                                   </div>
                            </div>

                     </motion.div>
              </section>
       );
};

export default Categoreis;
