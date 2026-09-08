// import { auth } from "@/auth";
// import AdminDashBoard from "@/component/Admin/AdminDashBoard";
// import EditRoleAurPhone from "@/component/EditRoleAurPhone";
// import Footer from "@/component/Footer";
// import Navbar from "@/component/Navbar";
// import UserDashBoard from "@/component/User/UserDashBoard";
// import VendorDashBoard from "@/component/Vendor/VendorDashBoard";
// import VendorPage from "@/component/Vendor/VendorPage";
// import VendorInfo from "@/component/VendorInfo";
// import connectDb from "@/lib/connectDb";
// import User from "@/model/user";
// import { redirect } from "next/navigation";

// export default async function Home() {
//   await connectDb();

//   const session = await auth();

//   if (!session?.user?.id) {
//     redirect("/register");
//   }

//   const findUser = await User.findById(session.user.id);

//   const user = JSON.parse(JSON.stringify(findUser));

//   if (!findUser) { // USER REGISTER YA LOGIN NHI HII REDIRECT KR DO REGISTER PAGE PR. 
//     redirect("/register");
//   }

//   const isExists = !findUser?.phone || !findUser?.userRole || (!findUser?.phone && !findUser?.userRole === "user"); // IS USER ROLE AND PHONE NUMER NHI HII TO RETIRUN KR DO <EditRoleAurPhone /> IS PAGE PR.
//   if (isExists) return <EditRoleAurPhone />;


//   if(user.userRole === "vendor"){
//     const isCompletedInfo = !user.shopName || !user.shopAddress || !user.gstNumber
//     if(isCompletedInfo){
//       return <VendorInfo />
//     }
//   }
//   return (
//     <div>
//       <Navbar user={user}/>
//       {findUser?.userRole === "user" ? <UserDashBoard /> : findUser?.userRole === "vendor" ? <VendorPage user={user}/> : <AdminDashBoard />}
//       <Footer user={user} />
//     </div>
//   );
// }



import { auth } from "@/auth";

import AdminDashBoard from "@/component/Admin/AdminDashBoard";
import EditRoleAurPhone from "@/component/EditRoleAurPhone";
import Footer from "@/component/Footer";
import Navbar from "@/component/Navbar";
import UserDashBoard from "@/component/User/UserDashBoard";
import VendorPage from "@/component/Vendor/VendorPage";
import VendorInfo from "@/component/VendorInfo";

import connectDb from "@/lib/connectDb";
import User from "@/model/user";

export default async function Home() {
  await connectDb();

  const session = await auth();

  // =====================================================
  // USER LOGIN NAHI HAI
  // =====================================================
  // Home page public rahega.
  // Register/Login par redirect nahi karenge.
  if (!session?.user?.id) {
    return (
      <div>
        <Navbar />

        <UserDashBoard />

        <Footer />
      </div>
    );
  }

  // =====================================================
  // LOGGED IN USER
  // =====================================================
  const findUser = await User.findById(session.user.id).lean();

  // Session hai lekin DB me user nahi mila
  if (!findUser) {
    return (
      <div>
        <Navbar />

        <UserDashBoard />

        <Footer />
      </div>
    );
  }

  // Plain object
  const user = JSON.parse(JSON.stringify(findUser));

  // =====================================================
  // PHONE / ROLE CHECK
  // =====================================================
  // Agar phone ya role missing hai
  // to EditRoleAurPhone page show karo.
  const isProfileIncomplete =
    !findUser.phone || !findUser.userRole;

  if (isProfileIncomplete) {
    return <EditRoleAurPhone />;
  }

  // =====================================================
  // VENDOR INFORMATION CHECK
  // =====================================================
  if (findUser.userRole === "vendor") {
    const isVendorInfoIncomplete =
      !findUser.shopName ||
      !findUser.shopAddress ||
      !findUser.gstNumber;

    if (isVendorInfoIncomplete) {
      return <VendorInfo />;
    }
  }

  // =====================================================
  // MAIN APPLICATION
  // =====================================================
  return (
    <div className="min-h-screen">
      <Navbar user={user} />

      {findUser.userRole === "user" && (
        <UserDashBoard user={user} />
      )}

      {findUser.userRole === "vendor" && (
        <VendorPage user={user} />
      )}

      {findUser.userRole === "admin" && (
        <AdminDashBoard user={user} />
      )}

      <Footer user={user} />
    </div>
  );
}