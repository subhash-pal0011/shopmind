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
  if (!session?.user?.id) {
    return (
      <div>
        <Navbar />

        <UserDashBoard />

        <Footer />
      </div>
    );
  }


  const findUser = await User.findById(session.user.id).lean();

  if (!findUser) {
    return (
      <div>
        <Navbar />

        <UserDashBoard />

        <Footer />
      </div>
    );
  }

  const user = JSON.parse(JSON.stringify(findUser));
  const isProfileIncomplete =
    !findUser.phone || !findUser.userRole;

  if (isProfileIncomplete) {
    return <EditRoleAurPhone />;
  }

  if (findUser.userRole === "vendor") {
    const isVendorInfoIncomplete =
      !findUser.shopName ||
      !findUser.shopAddress ||
      !findUser.gstNumber;

    if (isVendorInfoIncomplete) {
      return <VendorInfo />;
    }
  }


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