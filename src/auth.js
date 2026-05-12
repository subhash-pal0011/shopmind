import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDb from "./lib/connectDb";
import User from "./model/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
       providers: [
              Credentials({
                     name: "Credentials",

                     credentials: {
                            email: {
                                   label: "Email",
                                   type: "email",
                            },

                            password: {
                                   label: "Password",
                                   type: "password",
                            },
                     },

                     async authorize(credentials) {
                            try {
                                   await connectDb();

                                   const email = credentials?.email;
                                   const password = credentials?.password;

                                   if (!email || !password) {
                                          throw new Error("Email and Password are required");
                                   }

                                   const findUser = await User.findOne({ email });

                                   if (!findUser) {
                                          throw new Error("No user found with this email");
                                   }

                                   if (!findUser.userVerified) {
                                          throw new Error("Please verify your account first");
                                   }

                                   const comparePassword = await bcrypt.compare(
                                          password,
                                          findUser.password
                                   );

                                   if (!comparePassword) {
                                          throw new Error("Invalid credentials");
                                   }

                                   return {
                                          id: findUser._id.toString(),
                                          name: findUser.name,
                                          email: findUser.email,
                                          role: findUser.userRole,
                                   };
                            } catch (error) {
                                   throw new Error(error.message);
                            }
                     },
              }),
       ],

       callbacks: {
              async jwt({ token, user }) {
                     if (user) {
                            token.id = user.id;
                            token.name = user.name;
                            token.email = user.email;
                            token.role = user.role;
                     }

                     return token;
              },

              async session({ session, token }) {
                     if (session.user) {
                            session.user.id = token.id;
                            session.user.name = token.name;
                            session.user.email = token.email;
                            session.user.role = token.role;
                     }
                     return session;
              },
       },

       pages: { //Ye isliye use karte hain taki user login na ho to NextAuth ke default login page ki jagah hamara khud ka login page open ho.
              signIn: "/login",
       },

       session: { 
              strategy: "jwt", // User ka session JWT token ki help se manage ho raha hai.
              maxAge: 10 * 24 * 60 * 60,
       },

       secret: process.env.AUTH_SECRET,
});