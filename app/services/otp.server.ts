import otpGenerator from "otp-generator";
import crypto from "crypto";
import customErr from "~/utils/handler.server";
import { sendSMS } from "~/utils/sms.server";

export const createOTP = async (phone: string) => {
  try {
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const ttl = 5 * 60 * 1000;
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = crypto
      .createHmac("sha256", process.env.SECRATE_KEY as string)
      .update(data)
      .digest("hex");
    const fullHash = `${hash}.${expires}`;

    const resp = await sendSMS(
      phone,
      `Your OTP is ${otp}. it will expire in 5 minutes`
    );
    if (resp?.status === 202 && resp?.statusText === "Accepted" && resp?.data) {
      return { data: { fullHash, phone } }
    } else {
      return {
        error: {
          error: {
            message: "Failed to send otp, Please try again",
          },
        },
      }
    }
  } catch (err: any) {
    throw new customErr(
      "Custom_Error",
      err?.response?.data?.error?.message,
      err?.response?.status
    );
  }
};

export const verifyOTP = (phone: string, hash: string, otp: string) => {
  let [hashValue, expires] = hash.split(".");
  let now = Date.now();
  if (now > parseInt(expires))
    return {
      error: {
        message: "OTP has expired",
      },
    };

  let data = `${phone}.${otp}.${expires}`;
  let newCalculatedHash = crypto
    .createHmac("sha256", process.env.SECRATE_KEY as string)
    .update(data)
    .digest("hex");

  if (newCalculatedHash === hashValue) return true
  return false
};
