"use server";

import bcyrpt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCollection } from "../lib/db";

function isAlphaNumeric(str) {
  return /^[a-zA-Z0-9]*$/.test(str);
}

export const login = async function (prevState, formData) {
  const failObject = {
    success: false,
    message: "Invalid username or password",
  };

  const ourUser = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  if (typeof ourUser.username !== "string") ourUser.username = "";
  if (typeof ourUser.username !== "string") ourUser.username = "";

  const collection = await getCollection("users");
  const user = await collection.findOne({ username: ourUser.username });

  if (!user) {
    return failObject;
  }

  const matchOrNot = bcyrpt.compareSync(ourUser.password, user.password);

  if (!matchOrNot) {
    return failObject;
  }

  // create a JWT token
  const token = jwt.sign(
    { userId: user._id, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
    process.env.JWTSECRET
  );

  // log the user in by giving them a cookie (JWT)
  cookies().set("haiku-auth", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    secure: true,
  });

  return redirect("/");
};

export const logout = async function () {
  cookies().delete("haiku-auth");
  redirect("/");
};

export const register = async function (prevState, formData) {
  const errors = {};

  const ourUser = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  if (typeof ourUser.username !== "string") ourUser.username = "";
  if (typeof ourUser.username !== "string") ourUser.username = "";

  ourUser.username = ourUser.username.trim();
  ourUser.password = ourUser.password.trim();

  // validation username
  if (ourUser.username.length < 3)
    errors.username = "Username must be at least 3 characters long";
  if (ourUser.username.length > 30)
    errors.username = "Username cannot exceed 30 characters long";
  if (!isAlphaNumeric(ourUser.username))
    errors.username = "Username must be alphanumeric";
  if (ourUser.username == "") errors.username = "You must enter a username";

  // see if username already existed or not
  const usersCollection = await getCollection("users");
  const usernameExists = await usersCollection.findOne({
    username: ourUser.username,
  });
  if (usernameExists) errors.username = "Username already exists";

  // validation password
  if (ourUser.password.length < 12)
    errors.password = "Password must be at least 12 characters long";
  if (ourUser.password.length > 50)
    errors.password = "Password cannot exceed 50 characters long";
  if (ourUser.password == "") errors.password = "You must enter a password";

  if (errors.username || errors.password) return { errors, success: false };

  // hash password first
  const salt = bcyrpt.genSaltSync(10);
  ourUser.password = bcyrpt.hashSync(ourUser.password, salt);

  // storing a new user in the database
  const newUser = await usersCollection.insertOne(ourUser);
  const userId = newUser.insertedId.toString();

  // create a JWT token
  const token = jwt.sign(
    { userId: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
    process.env.JWTSECRET
  );

  // log the user in by giving them a cookie (JWT)
  cookies().set("haiku-auth", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    secure: true,
  });

  return {
    success: true,
  };
};
