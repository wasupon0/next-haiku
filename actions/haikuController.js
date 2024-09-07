"use server";

import cloudinary from "cloudinary";
import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { getCollection } from "../lib/db";
import { getUserFromCookie } from "../lib/getUser";

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isAlphaNumericWithBasics(text) {
  const regex = /^[a-zA-Z0-9 .,]*$/;
  return regex.test(text);
}

async function sharedHaikuLogic(formData, user) {
  const errors = {};

  const currentHaiku = {
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    line3: formData.get("line3"),
    author: ObjectId.createFromHexString(user.userId),
  };

  if (typeof currentHaiku.line1 !== "string") currentHaiku.line1 = "";
  if (typeof currentHaiku.line2 !== "string") currentHaiku.line2 = "";
  if (typeof currentHaiku.line3 !== "string") currentHaiku.line3 = "";

  currentHaiku.line1 = currentHaiku.line1.replace(/(\r\n|\n|\r)/g, " ");
  currentHaiku.line2 = currentHaiku.line2.replace(/(\r\n|\n|\r)/g, " ");
  currentHaiku.line3 = currentHaiku.line3.replace(/(\r\n|\n|\r)/g, " ");

  currentHaiku.line1 = currentHaiku.line1.trim();
  currentHaiku.line2 = currentHaiku.line2.trim();
  currentHaiku.line3 = currentHaiku.line3.trim();

  if (currentHaiku.line1.length < 5) {
    errors.line1 = "Too few words; must be 5";
  }
  if (currentHaiku.line1.length > 25) {
    errors.line1 = "Too much words; must be 5";
  }

  if (currentHaiku.line2.length < 5) {
    errors.line2 = "Too few words; must be 5";
  }
  if (currentHaiku.line2.length > 25) {
    errors.line2 = "Too much words; must be 5";
  }

  if (currentHaiku.line3.length < 5) {
    errors.line3 = "Too few words; must be 5";
  }
  if (currentHaiku.line3.length > 25) {
    errors.line3 = "Too much words; must be 5";
  }

  if (!isAlphaNumericWithBasics(currentHaiku.line1)) {
    errors.line1 = "Invalid characters";
  }

  if (!isAlphaNumericWithBasics(currentHaiku.line2)) {
    errors.line1 = "Invalid characters";
  }

  if (!isAlphaNumericWithBasics(currentHaiku.line3)) {
    errors.line1 = "Invalid characters";
  }

  if (currentHaiku.line1.length == 0) {
    errors.line1 = "Cannot be empty";
  }

  if (currentHaiku.line2.length == 0) {
    errors.line2 = "Cannot be empty";
  }

  if (currentHaiku.line3.length == 0) {
    errors.line3 = "Cannot be empty";
  }

  // verify haiku signature
  const expectedSignature = cloudinary.utils.api_sign_request({
    public_id: formData.get("public_id"),
    version: formData.get("version"),
  });

  if (expectedSignature !== formData.get("signature")) {
    currentHaiku.photo = formData.get("public_id");
  }

  return {
    errors,
    currentHaiku,
  };
}

export const createHaiku = async function (prevState, formData) {
  const user = await getUserFromCookie();

  if (!user) {
    return redirect("/");
  }

  const results = await sharedHaikuLogic(formData, user);

  if (results.errors.line1 || results.errors.line2 || results.errors.line3) {
    return results;
  }

  // save into db
  const haikusCollection = await getCollection("haikus");
  const newHaiku = await haikusCollection.insertOne(results.currentHaiku);
  return redirect("/");
};

export const editHaiku = async function (prevState, formData) {
  const user = await getUserFromCookie();

  if (!user) {
    return redirect("/");
  }

  const results = await sharedHaikuLogic(formData, user);

  if (results.errors.line1 || results.errors.line2 || results.errors.line3) {
    return results;
  }

  // save into db
  const haikusCollection = await getCollection("haikus");
  let haikuId = formData.get("haikuId");
  if (typeof haikuId !== "string") {
    haikuId = "";
  }

  //login as author to update haiku in db
  const currentHaiku = await haikusCollection.findOne({
    _id: ObjectId.createFromHexString(haikuId),
  });

  if (currentHaiku.author.toString() !== user.userId) {
    return redirect("/");
  }

  await haikusCollection.findOneAndUpdate(
    { _id: ObjectId.createFromHexString(haikuId) },
    { $set: results.currentHaiku }
  );

  return redirect("/");
};

export const deleteHaiku = async function (formData) {
  const user = await getUserFromCookie();

  if (!user) {
    return redirect("/");
  }

  // save into db
  const haikusCollection = await getCollection("haikus");
  let haikuId = formData.get("haikuId");
  if (typeof haikuId !== "string") {
    haikuId = "";
  }

  // login as author to update haiku in db
  const currentHaiku = await haikusCollection.findOne({
    _id: ObjectId.createFromHexString(haikuId),
  });

  if (currentHaiku.author.toString() !== user.userId) {
    return redirect("/");
  }

  await haikusCollection.deleteOne({
    _id: ObjectId.createFromHexString(haikuId),
  });

  return redirect("/");
};
