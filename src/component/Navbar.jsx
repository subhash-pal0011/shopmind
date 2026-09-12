"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { FiPhoneCall } from "react-icons/fi";
import { LuCircleUserRound, LuShoppingCart, LuX } from "react-icons/lu";
import { HiMiniBars3 } from "react-icons/hi2";
import { PiSignIn, PiSignOutFill } from "react-icons/pi";
import { RiListUnordered } from "react-icons/ri";
import { AiOutlineProduct } from "react-icons/ai";

const Navbar = ({ user = null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.userRole?.toLowerCase() || "";
  const isNormalUser = role === "user";
  const isVendor = role === "vendor";
  const isAdmin = role === "admin";

  const userImage = user?.image || user?.profileImage || null;

  const closeMenus = () => {
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const goTo = (path) => {
    closeMenus();
    if (pathname !== path) router.push(path);
  };

  const handleCall = () => {
    closeMenus();
    window.location.href = "tel:+919999999999";
  };

  const handleSignOut = async () => {
    closeMenus();
    await signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const ProfileButton = ({ icon, label, onClick, danger = false }) => (
    <button type="button" onClick={onClick} className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}`}>
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );

  const ProfileDropdown = () => (
    <AnimatePresence>
      {profileOpen && (
        <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.18, ease: "easeOut" }} className="absolute right-0 top-[calc(100%+10px)] z-100 w-62.5 max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-gray-100 bg-white p-1.5 shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
          {user ? (
            <>
              <div className="border-b border-gray-100 px-3 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                    {userImage ? <Image src={userImage} alt={user?.name || "User"} width={44} height={44} className="h-full w-full object-cover" /> : <LuCircleUserRound size={25} className="text-gray-500" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">{user?.email || ""}</p>

                    {role && <span className="mt-1.5 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-600">{role}</span>}
                  </div>
                </div>
              </div>

              <ProfileButton icon={<LuCircleUserRound size={18} />} label="User Profile" onClick={() => goTo("/edit-profile")} />

              {isNormalUser && <ProfileButton icon={<RiListUnordered size={18} />} label="Orders" onClick={() => goTo("/products")} />}

              <ProfileButton icon={<PiSignOutFill size={18} />} label="Sign Out" danger onClick={handleSignOut} />
            </>
          ) : (
            <>
              <div className="px-3 py-3.5">
                <p className="text-sm font-semibold text-gray-800">Welcome 👋</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Login to manage your account and orders.</p>
              </div>

              {/* <ProfileButton icon={<PiSignIn size={18} />} label="Login" onClick={() => goTo("/login")} /> */}
              <ProfileButton icon={<LuCircleUserRound size={18} />} label="Login/Register" onClick={() => goTo("/register")} />
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const IconButton = ({ icon, label, onClick, className = "" }) => (
    <motion.button type="button" whileHover={{ scale: 1.08, y: -1 }} whileTap={{ scale: 0.9 }} onClick={onClick} aria-label={label} className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-blue-500 ${className}`}>
      {icon}
    </motion.button>
  );

  const MobileMenuItem = ({ icon, label, onClick, danger = false, primary = false }) => (
    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onClick} className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${danger ? "text-red-500 hover:bg-red-50" : primary ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"}`}>
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </motion.button>
  );

  const UserInfoCard = () => (
    <div className="mb-6 rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
          {userImage ? <Image src={userImage} alt={user?.name || "User"} width={44} height={44} className="h-full w-full object-cover" /> : <LuCircleUserRound size={24} className="text-gray-500" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-800">{user?.name || "User"}</p>
          <p className="truncate text-xs text-gray-500">{user?.email || ""}</p>
          {role && <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-blue-500">{role}</p>}
        </div>
      </div>
    </div>
  );

  const MobileSidebar = () => (
    <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-9998 bg-black/40 backdrop-blur-[2px] sm:hidden" />

          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="fixed right-0 top-0 z-9999 flex h-100dvh w-75 max-w-[88vw] flex-col overflow-hidden bg-white shadow-2xl sm:hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
              <button type="button" onClick={() => goTo("/")} className="cursor-pointer" aria-label="Go to home">
                <Image src="/logo-2.png" alt="ShopMind Logo" width={150} height={45} priority className="h-auto w-31.25 object-contain" />
              </button>

              <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => setMobileOpen(false)} aria-label="Close menu" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-red-50 text-red-500 transition-colors hover:bg-red-100">
                <LuX size={20} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
              {user ? (
                <>
                  <UserInfoCard />

                  {isNormalUser && (
                    <div className="space-y-1.5">
                      <MobileMenuItem icon={<AiOutlineProduct size={20} />} label="Products" onClick={() => goTo("/products")} />
                      <MobileMenuItem icon={<FiPhoneCall size={20} />} label="Call" onClick={handleCall} />
                      <MobileMenuItem icon={<LuShoppingCart size={20} />} label="Shopping Cart" onClick={() => goTo("/addCard")} />
                      <MobileMenuItem icon={<LuCircleUserRound size={20} />} label="User Profile" onClick={() => goTo("/edit-profile")} />
                      <MobileMenuItem icon={<RiListUnordered size={20} />} label="Orders" onClick={() => goTo("/products")} />
                    </div>
                  )}

                  {(isVendor || isAdmin) && (
                    <div className="space-y-1.5">
                      <MobileMenuItem icon={<FiPhoneCall size={20} />} label="Call" onClick={handleCall} />
                      <MobileMenuItem icon={<LuCircleUserRound size={20} />} label="User Profile" onClick={() => goTo("/edit-profile")} />
                    </div>
                  )}

                  <div className="my-5 border-t border-gray-100" />

                  <MobileMenuItem icon={<PiSignOutFill size={20} />} label="Sign Out" danger onClick={handleSignOut} />
                </>
              ) : (
                <>
                  <div className="mb-6 rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">Welcome to ShopMind 👋</p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">Login when you are ready to place an order.</p>
                  </div>

                  <div className="space-y-1.5">
                    <MobileMenuItem icon={<FiPhoneCall size={20} />} label="Call" onClick={handleCall} />
                    {/* <MobileMenuItem icon={<PiSignIn size={20} />} label="Login" primary onClick={() => goTo("/login")} /> */}
                    <MobileMenuItem icon={<LuCircleUserRound size={20} />} label="Login/Register" onClick={() => goTo("/register")} />
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 px-3 py-2.5 shadow-sm backdrop-blur-md sm:px-4 sm:py-3">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
          <button type="button" onClick={() => goTo("/")} aria-label="Go to home" className="flex min-w-0 shrink-0 cursor-pointer items-center">
            <Image src="/logo-2.png" alt="ShopMind Logo" width={220} height={55} priority className="h-auto w-35 object-contain sm:w-50 md:w-43.75 lg:w-50" />
          </button>

          <div className="flex shrink-0 items-center">
            {user && isNormalUser && (
              <div className="flex items-center gap-5 sm:gap-8 md:gap-8">
                <div className="hidden sm:block">
                  <IconButton icon={<AiOutlineProduct size={25} />} label="Products" onClick={() => goTo("/products")} />
                </div>

                <div className="hidden sm:block">
                  <IconButton icon={<FiPhoneCall size={20} />} label="Call" onClick={handleCall} />
                </div>

                <div className="hidden sm:block">
                  <IconButton icon={<LuShoppingCart size={23} />} label="Shopping Cart" onClick={() => goTo("/addCard")} />
                </div>

                <div ref={profileRef} className="relative">
                  <IconButton icon={<LuCircleUserRound size={24} />} label="User Profile" onClick={() => setProfileOpen((prev) => !prev)} />
                  <ProfileDropdown />
                </div>

                <div className="sm:hidden">
                  <IconButton icon={mobileOpen ? <LuX size={23} className="text-red-500" /> : <HiMiniBars3 size={24} />} label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => { setProfileOpen(false); setMobileOpen((prev) => !prev); }} />
                </div>
              </div>
            )}

            {user && (isVendor || isAdmin) && (
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-8">
                <IconButton icon={<FiPhoneCall size={20} />} label="Call" onClick={handleCall} />

                <div ref={profileRef} className="relative">
                  <IconButton icon={<LuCircleUserRound size={23} />} label="User Profile" onClick={() => setProfileOpen((prev) => !prev)} />
                  <ProfileDropdown />
                </div>

                <div className="sm:hidden">
                  <IconButton icon={mobileOpen ? <LuX size={23} className="text-red-500" /> : <HiMiniBars3 size={24} />} label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => { setProfileOpen(false); setMobileOpen((prev) => !prev); }} />
                </div>
              </div>
            )}

            {!user && (
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                <IconButton icon={<FiPhoneCall size={20} />} label="Call" onClick={handleCall} />

                <div ref={profileRef} className="relative">
                  <IconButton icon={<LuCircleUserRound size={23} />} label="Login" onClick={() => setProfileOpen((prev) => !prev)} />
                  <ProfileDropdown />
                </div>

                <div className="sm:hidden">
                  <IconButton icon={mobileOpen ? <LuX size={23} className="text-red-500" /> : <HiMiniBars3 size={24} />} label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => { setProfileOpen(false); setMobileOpen((prev) => !prev); }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <MobileSidebar />
    </>
  );
};

export default Navbar;