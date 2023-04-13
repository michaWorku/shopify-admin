import axios from "axios";
import customErr from "~/utils/handler.server";

type RewardData = {
    client_id: string,
    reward_id: string,
    phone: string,
    subscription_plan: string,
    client_name: string
}

/**
 * Reward a user via the Sewasew platform.
 * @param {RewardData} rewardData - The reward data to send.
 * @returns {Promise<{status: number, data: any}>} - An object containing the HTTP status and response data.
 */
export const sewasewReward = async (rewardData: RewardData) => {
    try {
      const { status, data } = await axios.post(
        `${process.env.SEWASEW_REWARD}`,
        { ...rewardData },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${process.env.SMS_SERVICES_USERNAME}:${process.env.SMS_SERVICES_PASSWORD}`
            ).toString('base64')}`,
          },
        }
      );
      console.log({ status, data });
      return { status, data };
    } catch (err: any) {
      console.log('error encountered while rewarding a user.');
      console.dir({ err: err.response?.data });
      return { status: err?.response?.status, message: err.response?.data?.error?.message };
    }
  };
  