import { io } from "socket.io-client";

let socket = null;

export const socketConnection = () => {
       try {

              if (!process.env.NEXT_PUBLIC_NODE_SOCKET_URL) {
                     throw new Error("NEXT_PUBLIC_NODE_SOCKET_URL is not defined");
              }

              if (!socket) {
                     //  process.env.NEXT_PUBLIC_NODE_SOCKET_UR  Agar ye line hata do: to Socket.IO pehle polling try karega, phir WebSocket par switch hoga.
                     socket = io(process.env.NEXT_PUBLIC_NODE_SOCKET_URL, {

                            transports: ["websocket"], // Agar ye line laga do: to Socket.IO bolega: "Mujhe polling nahi chahiye, main seedha WebSocket se connect karunga."


                            reconnection: true, // ye reconnection settings hain. Agar internet chala jaye ya server band ho jaye, to Socket.IO dobara connect hone ki koshish karta hai.

                            reconnectionAttempts: 5, // 👉 Connection toot gaya to automatically dubara connect karne ki koshish karo.  👉 Maximum 5 baar retry karega. 5 baar fail hua to ruk jayega.

                            reconnectionDelay: 1000, // 👉 Har retry ke beech 1000ms (1 second) wait karega.
                     });

                     socket.on("connect", () => {
                            console.log("socket Connected:", socket.id);
                     });

                     socket.on("disconnect", (reason) => {
                            console.log("Socket Disconnected:", reason);
                     });

                     socket.on("connect_error", (error) => {
                            console.error("Socket Connection Error:", error.message);
                     });
              }

              if (!socket.connected) {
                     socket.connect();
              }

              return socket;
       } catch (error) {
              console.error("Socket Initialization Error:", error);
              return null;
       }
};

export const disconnectSocket = () => { // DISCONECT KE LIYE
       if (socket) {
              socket.disconnect();
              socket = null;
       }
};

