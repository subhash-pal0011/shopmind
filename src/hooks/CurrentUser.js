import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const CurrentUser = () => {
       
       const dispatch = useDispatch();

       useEffect(() => {
              const getCurrentUser = async () => {
                     try {
                            const res = await axios.get("/api/currentUser");
                            if (res.data.success) {
                                   toast.success(res.data.message)
                            }
                     } catch (error) {
                            console.log("get current-user error:", error);
                     }
              }
              getCurrentUser()
       }, [dispatch])
}

export default CurrentUser
