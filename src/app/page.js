import { auth } from "@/auth";
import AdminDashBoard from "@/component/Admin/AdminDashBoard";
import EditRoleAurPhone from "@/component/EditRoleAurPhone";
import Navbar from "@/component/Navbar";
import UserDashBoard from "@/component/User/UserDashBoard";
import VendorDashBoard from "@/component/Vendor/VendorDashBoard";
import connectDb from "@/lib/connectDb";
import User from "@/model/user";
import { redirect } from "next/navigation";

export default async function Home() {
  await connectDb();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/register");
  }

  const findUser = await User.findById(session.user.id);

  const user = JSON.parse(JSON.stringify(findUser));

  if (!findUser) {
    redirect("/register");
  }

  const isExists = !findUser?.phone || !findUser?.userRole || (!findUser?.phone && !findUser?.userRole === "user");

  if (isExists) return <EditRoleAurPhone />;

  return (
    <div>
      <Navbar user={user}/>
      {findUser?.userRole === "user" ? <UserDashBoard /> : findUser?.userRole === "vendor" ? <VendorDashBoard /> : <AdminDashBoard />}
    </div>
  );
}
