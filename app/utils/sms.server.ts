import axios from "axios";
import customErr from "./handler.server";

/**
 * Sends an SMS message to the specified phone number.
 *
 * @param {string} to The phone number to send the SMS to.
 * @param {string} text The text of the message to send.
 * @returns {Promise<{ status: number, statusText: string, data: any }>} The response object from the SMS service.
 * @throws {CustomError} If there was an error sending the SMS.
 */

export const sendSMS = async (to: string, text: string) => {
    try {
        const { status, statusText, data } = await axios.post(`${process.env.REACT_APP_SERVICES_SMS}`, {
            to, text
        },
            {
                auth: {
                    username: process.env.SMS_SERVICES_USERNAME as string,
                    password: process.env.SMS_SERVICES_PASSWORD as string
                }
            })
        console.log({ status, statusText, data })
        return { status, statusText, data }
    } catch (err: any) {
        console.log("error encountered while sending SMS.");
        console.log({ err: err })
        throw new customErr(
            "Custom_Error",
            err?.response?.data?.error?.message,
            err?.response?.status
        );
    }
}