// "use client";
// import { motion } from "motion/react";
// import Image from "next/image";
// import React, { useEffect, useRef } from "react";
// import { GoArrowLeft } from "react-icons/go";
// import { LuArrowRight } from "react-icons/lu";


// const Categoreis = () => {
//        const scrollRef = useRef(null);
//        console.log("scrol :" , scrollRef)

//        const categories = [
//               { id: 1, name: "Fashion", image: "/fashion.gif" },
//               { id: 2, name: "Shoes", image: "/shoes.gif" },
//               { id: 3, name: "Electronics", image: "/electronics.gif" },
//               { id: 4, name: "Mobiles", image: "/phone.gif" },
//               { id: 5, name: "Beauty", image: "/beauty.gif" },
//               { id: 6, name: "Home & Kitchen", image: "/HomeKichen.gif" },
//               { id: 7, name: "Books", image: "/Books.gif" },
//               { id: 8, name: "Sports", image: "/sport.gif" },
//        ];

//        const leftScroll = ()=>{

//               scrollRef.current.scrollBy({
//                      left:-210,
//                      behavior:"smooth"
//               })
//        }
//        const rightScroll = ()=>{
//               scrollRef.current.scrollBy({
//                      left:210,
//                      behavior:"smooth"
//               })
//        }
//        useEffect(() => {
//               const interval = setInterval(() => {

//                      if (!scrollRef.current) return;

//                      const container = scrollRef.current; 


//                      container.scrollBy({
//                             left: 210,
//                             behavior: "smooth",
//                      });

//                      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {

//                             setTimeout(() => {
//                                    container.scrollTo({
//                                           left: 0,
//                                           behavior: "smooth",
//                                    });
//                             }, 500);
//                      }
//               }, 3000);

//               return () => clearInterval(interval);
//        }, []);

//        return (
//               <section className="w-full p-5 bg-gray-50">
//                      <motion.div
//                             initial={{ opacity: 0, y: 50, scale: 0.95 }}
//                             whileInView={{ opacity: 1, y: 0, scale: 1 }}
//                             transition={{ duration: 0.6 }}
//                             className="space-y-5 relative">

//                             <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
//                                    Shop by Category
//                             </h2>

//                             <div
//                                    ref={scrollRef}
//                                    className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
//                             >
//                                    {categories.map((item) => (
//                                           <motion.div
//                                                  key={item.id}
//                                                  whileHover={{ y: -8, scale: 1.05 }}
//                                                  transition={{ duration: 0.2 }}
//                                                  className="min-w-45 bg-white rounded-2xl shadow-md hover:shadow-xl cursor-pointer p-4 flex flex-col items-center"
//                                           >
//                                                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
//                                                         <Image
//                                                                src={item.image}
//                                                                alt={item.name}
//                                                                fill
//                                                                className="object-cover hover:scale-110 transition-transform duration-300"
//                                                         />
//                                                  </div>

//                                                  <p className="mt-4 text-center font-semibold text-gray-800">
//                                                         {item.name}
//                                                  </p>
//                                           </motion.div>
//                                    ))}
//                                    <div className="flex gap-3 w-full absolute justify-between top-30">
//                                           <button onClick={()=>leftScroll()} className="p-2 rounded-full bg-white shadow hover:scale-105 transition cursor-pointer">
//                                                  <GoArrowLeft />
//                                           </button>

//                                           <button onClick={()=>rightScroll()} className="p-2 rounded-full bg-white shadow hover:scale-105 transition cursor-pointer">
//                                                  <LuArrowRight />
//                                           </button>
//                                    </div>
//                             </div>

//                      </motion.div>
//               </section>
//        );
// };

// export default Categoreis;



"use client";
import { motion } from "motion/react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { LuArrowRight } from "react-icons/lu";


const Categoreis = () => {
       const scrollRef = useRef(null);
       const [hover, setHover] = useState(false);
       console.log("hover : ", hover)

       const categories = [
              { id: 1, name: "Fashion", image: "/fashion.gif" },
              { id: 2, name: "Shoes", image: "/shoes.gif" },
              { id: 3, name: "Electronics", image: "/electronics.gif" },
              { id: 4, name: "Digital", image: "/phone.gif" },
              { id: 5, name: "Beauty", image: "/beauty.gif" },
              { id: 6, name: "Home & Kitchen", image: "/HomeKichen.gif" },
              { id: 7, name: "Books", image: "/Books.gif" },
              { id: 8, name: "Sports", image: "/sport.gif" },
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

                            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800">
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
                                                 <div className="relative w-24 h-24 rounded-full overflow-hidden ">
                                                        <Image
                                                               src={item.image}
                                                               alt={item.name}
                                                               fill
                                                               className="object-cover hover:scale-150 transition-all duration-300"
                                                        />
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
