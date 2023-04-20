import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import PinInput from "react-pin-input";
import { toast } from "react-toastify";
import SendIcon from "@mui/icons-material/Send";
import Countdown from "react-countdown-now";
import Lottie from "lottie-react";
import rewardAnimation from "../../../../../../../public/assets/animations/reward.json";
import {
  checkReward,
  getReward,
  verifyUser,
} from "~/services/Reward/Reward.server";
import { SubmissionForm } from "~/src/components/Forms/";
import { requestFormHandler } from "~/utils/formHandler";
import customErr, { Response, errorHandler } from "~/utils/handler.server";
import { verifyOTP } from "~/services/otp.server";
import { destroySession, getSession } from "~/services/session.server";
import { SewasewBlackLogo } from "public/assets";
import { Download } from "~/src/components";
import { handleDynamicFormSubmission } from "~/services/DynamicFormSubmission/DynamicFormSubmission.server";

const ENV = {
  REACT_APP_DOWNLOAD_IOS:
    "https://apps.apple.com/us/app/sewasew-music/id1623030941",
  REACT_APP_DOWNLOAD_ANDROID:
    "https://play.google.com/store/apps/details?id=com.sewasewmusic.music.android",
};

/**
 * Loader function to fetch reward form
 * Checks if a reward can be given to a user
 * @async function loader
 * @param request The incoming HTTP request.
 * @param params The URL params for the current route.
 * @returns The response data for reward route.
 */
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    // Retrieve the reward data
    const rewardData = (await getReward(params?.rewardId as string))?.data;

    return json(Response({
      data:{
        ...rewardData
      }
    }))
  } catch (error) {
    console.log("Error occured loading reward");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};


/**
 * Renders the SubmitForm component.
 * @returns {JSX.Element} JSX element containing the send otp, verify otp, submission form and reward components.
 */
const SubmitForm = () => {
  const loaderData = useLoaderData();
  const [state, setState] = useState({ otp: "", sendOTP: false });
  let pin: any;

  useEffect(() => {
    console.log({ loaderData });
    if (loaderData?.data?.message) {
      toast.success(loaderData?.data?.message);
    }
  }, [loaderData]);

  

  return (
    <Stack
      direction="row"
      sx={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
        background:
          "transparent linear-gradient(180deg, #642525 0%, #240101 100%)",
        boxShadow: "3px 3px 6px #00000014",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: { xs: "100%", sm: "90%", md: "80%" },
        }}
      >
          <Box
            sx={{
              width: "100%",
              background: "#FFFFFF",
              boxShadow: "0px 3px 6px #00000029",
              borderRadius: { xs: 0, sm: "8px" },
              p: { xs: 4, sm: 5, md: 6 },
              textAlign: "start",
              color: "primary.main",
            }}
          >
            <SubmissionForm
              actionData={{}}
              fetcher={{}}
              loaderData={
                loaderData?.data
              }
              navigation={{}}
            />
          </Box>
        
      </Box>
    </Stack>
  );
};

export default SubmitForm;
