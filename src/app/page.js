import { auth } from "@/auth";
import EditRoleAurPhone from "@/component/EditRoleAurPhone";
import Navbar from "@/component/Navbar";
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

  if (!findUser) {
    redirect("/register");
  }

  const isExists = !findUser?.phone || !findUser?.userRole || (!findUser?.phone && !findUser?.userRole === "user");

  if (isExists) return <EditRoleAurPhone />;

  return (
    <div className="bg-gray-500">
      <Navbar />
    </div>
  );
}
