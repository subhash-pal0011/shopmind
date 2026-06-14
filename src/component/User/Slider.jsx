"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

const Slider = () => {
       const [hoverStopSlide, setHoverStopSlide] = useState(false);

       const slides = [
              {
                     id: 1,
                     img: "/womenDress.jpg",
                     title: "Women's Fashion Collection",
                     description:
                            "Discover the latest trends in women's fashion with stylish dresses, premium fabrics, and elegant designs for every occasion.",
              },
              {
                     id: 2,
                     img: "/shose.jpg",
                     title: "Premium Footwear",
                     description:
                            "Step into comfort and style with our collection of trendy sneakers, casual shoes, and premium footwear.",
              },
              {
                     id: 3,
                     img: "/smart.jpg",
                     title: "Smart Gadgets",
                     description:
                            "Explore innovative smart devices and accessories designed to make your daily life more connected and convenient.",
              },
       ];

       const [currentNum, setCurrentNum] = useState(0);

       // SLIDER SCROOL LOGIC
       useEffect(() => {
              if (hoverStopSlide) return
              const timer = setInterval(() => {
                     setCurrentNum((prev) => (prev + 1) % slides.length);
              }, 5000);

              return () => clearInterval(timer);
       }, [slides.length, hoverStopSlide]);

       return (
              <div className="w-full h-screen overflow-hidden">
                     <AnimatePresence mode="wait">
                            <motion.div key={slides[currentNum].id}
                                   onMouseEnter={() => setHoverStopSlide(true)}
                                   onMouseLeave={() => setHoverStopSlide(false)}
                                   initial={{ opacity: 0, scale: 1.05 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   exit={{ opacity: 0 }}
                                   transition={{ duration: 0.8 }}
                                   className="relative w-full h-screen"
                            >
                                   <Image
                                          src={slides[currentNum].img}
                                          alt={slides[currentNum].title}
                                          fill
                                          priority
                                          className="object-cover"
                                   />

                                   {/* Dark Overlay */}
                                   <div className="absolute inset-0 bg-black/40" />

                                   {/* Content */}
                                   <div className="absolute inset-0 flex items-center">
                                          <div className="max-w-2xl px-6 md:px-16 text-white">
                                                 <motion.h1
                                                        initial={{ y: 30, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="text-4xl md:text-6xl font-bold mb-4"
                                                 >
                                                        {slides[currentNum].title}
                                                 </motion.h1>

                                                 <motion.p
                                                        initial={{ y: 30, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.4 }}
                                                        className="text-lg md:text-xl text-gray-200"
                                                 >
                                                        {slides[currentNum].description}
                                                 </motion.p>

                                                 <motion.button
                                                        initial={{ y: 30, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.6 }}
                                                        className="mt-6 px-6 py-3 bg-white text-black rounded-lg font-semibold hover:scale-105 transition"
                                                 >
                                                        Shop Now
                                                 </motion.button>
                                          </div>
                                   </div>
                            </motion.div>
                     </AnimatePresence>
              </div>
       );
};

export default Slider;

