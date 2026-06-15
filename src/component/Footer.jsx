import React from "react";

const Footer = ({ user }) => {
       const role = user?.userRole;

       const roleText = {
              admin: {
                     title: "Admin Panel",
                     desc: "Manage vendors, products, orders and platform analytics.",
              },
              vendor: {
                     title: "Vendor Hub",
                     desc: "Grow your business, manage products and track orders.",
              },
              user: {
                     title: "Smart Shopping",
                     desc: "Discover products, track orders and enjoy seamless shopping.",
              },
       };

       const currentRole = roleText[role] || {
              title: "Welcome to ShopMind",
              desc: "Explore products and enjoy a seamless shopping experience.",
       };

       const buttonStyle =
              "relative w-fit text-blue-500 transition-all duration-300 hover:text-blue-700 hover:translate-x-1 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full cursor-pointer";

       return (
              <footer initial={{ y: 50, opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ duration: 0.9 }}
                     className="text-black/60 border-t">
                     <div className="max-w-7xl mx-auto px-6 py-10">
                            <div className="grid md:grid-cols-3 gap-8">

                                   {/* Brand */}
                                   <div>
                                          <h2 className="text-2xl font-bold text-black">
                                                 ShopMind
                                          </h2>

                                          <p className="text-blue-500 mt-3 text-sm">
                                                 Your modern e-commerce platform for smarter shopping
                                                 and seamless business management.
                                          </p>
                                   </div>

                                   {/* Role Section */}
                                   <div>
                                          <h3 className="font-semibold text-lg text-black">
                                                 {currentRole.title}
                                          </h3>

                                          <p className="text-blue-500 text-sm mt-2">
                                                 {currentRole.desc}
                                          </p>
                                   </div>

                                   {/* Quick Buttons */}
                                   <div>
                                          <h3 className="font-semibold text-lg text-black">
                                                 Quick Buttons
                                          </h3>

                                          {role === "user" ? (
                                                 <div className="flex flex-col gap-2 mt-3 text-sm">
                                                        <button className={buttonStyle}>Home</button>
                                                        <button className={buttonStyle}>Categories</button>
                                                        <button className={buttonStyle}>Shop</button>
                                                        <button className={buttonStyle}>Orders</button>
                                                 </div>
                                          ) : role === "vendor" ? (
                                                 <div className="flex flex-col gap-2 mt-3 text-sm">
                                                        <button className={buttonStyle}>Dashboard</button>
                                                        <button className={buttonStyle}>Products</button>
                                                        <button className={buttonStyle}>Orders</button>
                                                 </div>
                                          ) : role === "admin" ? (
                                                 <div className="flex flex-col gap-2 mt-3 text-sm">
                                                        <button className={buttonStyle}>Dashboard</button>
                                                        <button className={buttonStyle}>Vendor Details</button>
                                                        <button className={buttonStyle}>User Orders</button>
                                                        <button className={buttonStyle}>Vendor Approval</button>
                                                        <button className={buttonStyle}>Product Requests</button>
                                                 </div>
                                          ) : (
                                                 <div className="flex flex-col gap-2 mt-3 text-sm">
                                                        <button className={buttonStyle}>Home</button>
                                                        <button className={buttonStyle}>Shop</button>
                                                        <button className={buttonStyle}>Login</button>
                                                 </div>
                                          )}
                                   </div>
                            </div>

                            <div className="border-t mt-8 pt-5 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                                   <p>
                                          © {new Date().getFullYear()} ShopMind. All rights reserved.
                                   </p>

                                   <p>
                                          Logged in as{" "}
                                          <span className="text-blue-500 font-medium capitalize cursor-pointer">
                                                 {role || "Guest"}
                                          </span>
                                   </p>
                            </div>
                     </div>
              </footer>
       );
};

export default Footer;
