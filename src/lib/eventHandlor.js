import axios from "axios";

const eventHandler = async (event, data) => {
       try {
              const res = await axios.post(
                     `${process.env.NEXT_PUBLIC_NODE_SOCKET_URL}/notification`,
                     {event, data }
              );

       } catch (error) {
              console.error("eventHandler error:", error?.response?.data || error.message);
       }
};

export default eventHandler;