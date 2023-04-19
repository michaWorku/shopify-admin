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
    // console.log({ user, params });

    // Verify the user, after checking a user is rewarded
    let phone = params?.phone as string;
    const parsedPhone = phone.startsWith("+") ? phone.slice(1) : phone;
    phone = parsedPhone.startsWith("2519")
      ? parsedPhone
      : `251${
          parsedPhone.startsWith("0")
            ? parsedPhone.slice(1)
            : parsedPhone.startsWith("251")
            ? parsedPhone.slice(3)
            : parsedPhone
        }`;
    const verfied = await checkReward(
      params?.rewardId as string,
      params?.clientId as string,
      phone
    );

    return verfied;
  } catch (error) {
    console.log("Error occured loading reward");
    console.dir(error, { depth: null });
    return errorHandler(error);
  }
};

/**
 * Action function Handles dynamic form submissions and verifies OTPs.
 * @async function action
 *
 * @param {Object} options - The options object.
 * @param {Request} options.request - The incoming request object.
 * @param {Object} options.params - The URL parameters object.
 * @param {string} options.params.phone - The phone number string.
 * @param {string} options.params.rewardId - The reward ID string.
 * @param {string} options.params.clientId - The client ID string.
 *
 * @returns {Promise<Response>} A response with the result of the action.
 *
 * @throws {customErr} Throws a custom error if the action fails.
 */
export const action: ActionFunction = async ({ request, params }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const requestFormData = (await requestFormHandler(request)) as any;
    console.log({ requestFormData });
    let phone = params?.phone as string;
    const parsedPhone = phone.startsWith("+") ? phone.slice(1) : phone;
    phone = parsedPhone.startsWith("2519")
      ? parsedPhone
      : `251${
          parsedPhone.startsWith("0")
            ? parsedPhone.slice(1)
            : parsedPhone.startsWith("251")
            ? parsedPhone.slice(3)
            : parsedPhone
        }`;
    switch (request.method) {
      case "POST":
        console.log({ requestFormData });
        if (!Object.keys(requestFormData).length) {
          throw new customErr("Custom_Error", "Invalid submission data", 400);
        }
        const response = await handleDynamicFormSubmission(
          params?.rewardId as string,
          params?.clientId as string,
          requestFormData?.data?.submitedData,
          phone
        );
        return response;
      case "PUT":
        if (requestFormData?.data?.data?.resend) {
          const verfied = await verifyUser(
            request,
            params?.rewardId as string,
            params?.clientId as string,
            params?.phone as string
          );

          return verfied;
        } else {
          const hash = session.get("hash");
          console.log({ hash });
          if (!!hash && !!requestFormData?.data?.otp && !!params?.phone) {
            console.log({ hash });
            const verified = verifyOTP(
              params?.phone,
              hash,
              requestFormData?.data?.otp
            );

            if (verified) {
              // Get a reward form to fill the form
              const reward = (await getReward(
                params?.rewardId as string
              )) as any;

              console.dir({ reward: reward?.data });

              if (reward?.status === 404) {
                return json(
                  Response({
                    error: {
                      error: {
                        message: "No reward found",
                      },
                    },
                  }),
                  {
                    headers: {
                      "Set-Cookie": await destroySession(session),
                    },
                  }
                );
              }

              return json(
                Response({
                  data: {
                    ...reward,
                    submit: true,
                  },
                }),
                {
                  headers: {
                    "Set-Cookie": await destroySession(session),
                  },
                }
              );
            }
          }
          throw new customErr("Custom_Error", "Invalid or Expired OTP", 400);
        }
      default:
        throw new customErr("Custom_Error", "Unsupported action!", 403);
    }
  } catch (error: any) {
    console.error("error occured performing operation on dynamic form");
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
  const location = useLocation();
  const [actionData, setActionData] = useState(null);
  const fetcher = useFetcher();
  const [openModal, setOpenModal] = useState(false);
  const [state, setState] = useState({ otp: "", sendOTP: false });
  let pin: any;
  const navigation = useNavigation();
  const params = useParams();

  useEffect(() => {
    console.log({ loaderData });
    if (loaderData?.data?.message) {
      toast.success(loaderData?.data?.message);
    }
  }, [loaderData]);

  useEffect(() => {
    console.log({ fetcher });
    if (fetcher?.data?.error?.error?.message) {
      toast.error(fetcher?.data?.error?.error?.message);
    }
    if (fetcher?.data?.message) {
      toast.success(fetcher?.data?.message);
    }
    if (fetcher?.data) setActionData(fetcher?.data);
    if (fetcher?.data?.data?.sendOTP) {
      setState((prev) => ({ ...prev, sendOTP: true }));
    }
  }, [fetcher?.data]);

  const handleOTPChange = (value: string, index: number) => {
    if (fetcher?.data?.error?.error?.message)
      fetcher.data.error.error.message = null;
    setState((prev) => ({ ...prev, otp: value }));
  };

  const handleOTPCheck = async (otp: string) => {
    fetcher.submit(
      {
        data: JSON.stringify({ phone: params?.phone, otp }),
      },
      { method: "put" }
    );
  };

  const SendOTP = (
    <Box
      sx={{
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        // width: "450px",
        background: "#FFFFFF",
        boxShadow: "0px 3px 6px #00000029",
        borderRadius: "10px",
        // p: 6,
        px: { xs: 1, sm: 4, md: 6 },
        py: { xs: 6 },
        width: { xs: "100%", sm: "450px" },
        textAlign: "center",
        color: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          width: "95%",
          "& .MuiTextField-root": { my: 1 },
          "& .MuiInputLabel-root ": {
            color: "primary.main",
            fontSize: "1rem",
            fontWeight: "400",
          },
          "& .MuiOutlinedInput-root": {
            color: "primary.main",
            fontSize: "18px",
            borderRadius: "8px",
          },
          "& .MuiTypography-root": {
            color: "primary.main",
          },
        }}
      >
        <Form
          onSubmit={() => {
            fetcher.submit(
              {
                data: JSON.stringify({
                  data: { phone: params?.phone, resend: true },
                }),
              },
              { method: "put" }
            );
          }}
        >
          <Typography
            variant="h4"
            component="h3"
            sx={{ m: { xs: "1rem 0", sm: "1.5rem 0", md: "2rem 0" } }}
          >
            Verify Phone number
          </Typography>
          <TextField
            type="tel"
            required
            label="Phone"
            variant="outlined"
            fullWidth
            color="primary"
            name="phone"
            value={params?.phone}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ color: "primary.main" }}>
                  +251
                </InputAdornment>
              ),
            }}
          />
          <LoadingButton
            size="large"
            endIcon={<SendIcon />}
            loading={
              fetcher.state === "submitting" || navigation.state === "loading"
            }
            loadingPosition="end"
            variant="contained"
            fullWidth
            type="submit"
            sx={{
              p: 2,
              mt: 2,
              borderRadius: "8px",
              background: "#601E1D",
            }}
          >
            {!state.sendOTP && navigation.state === "submitting"
              ? "Sending..."
              : "Send OTP"}
          </LoadingButton>
        </Form>
      </Box>
    </Box>
  );

  const Renderer = ({ hours, minutes, seconds, completed }: any) => {
    if (completed) {
      return (
        <Button
          variant="text"
          fullWidth
          sx={{
            width: "60%",
            color: "primary.main",
            border: "none",
            outline: "none",
            background: "none",
          }}
          type="button"
          onClick={() => {
            pin.clear();
            fetcher.submit(
              {
                data: JSON.stringify({
                  data: { phone: params?.phone, resend: true },
                }),
              },
              { method: "put" }
            );
          }}
        >
          Resend Code
        </Button>
      );
    } else {
      return (
        <Typography variant="subtitle1" sx={{ color: "rgba(0,0,0,.38)" }}>
          Resend code in {seconds}
        </Typography>
      );
    }
  };

  const Verify = (
    <Box
      sx={{
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "450px",
        background: "#FFFFFF",
        boxShadow: "0px 3px 6px #00000029",
        borderRadius: "10px",
        p: 6,
        textAlign: "end",
        color: "primary.main",
      }}
    >
      <Grid container direction="column" spacing={2}>
        <Grid
          item
          container
          xs={12}
          sx={{ cursor: "pointer" }}
          mt={-1}
          mb={1}
          display="flex"
          alignItems="baseline"
          justifyContent="center"
        >
          <Typography
            variant="body2"
            component="h6"
            textAlign="center"
            alignItems="baseline"
            marginRight={2}
          >
            {params?.phone}
          </Typography>
        </Grid>
        <Typography
          variant="h5"
          component="h6"
          textAlign="center"
          sx={{ fontWeight: "700" }}
        >
          Enter 4 Digit verification code
        </Typography>
        <Typography variant="body1" component="span" textAlign="center">
          We have sent you the SMS verification code
        </Typography>
        <Grid
          item
          container
          xs={12}
          sx={{
            "& .MuiTextField-root": {
              m: 0,
              width: "100%",
              border: "none",
              outline: "none",
            },
          }}
          display="flex"
          alignItems="baseline"
          justifyContent="center"
        >
          <Grid item xs={12}>
            <PinInput
              length={4}
              initialValue=""
              onChange={handleOTPChange}
              type="numeric"
              inputMode="number"
              style={{
                padding: "2px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              inputStyle={{
                background: "#F5F5F5",
                border: "1px solid #878787",
                fontSize: "18px",
                width: "54px",
                height: "62px",
                borderRadius: "8px",
                margin: "0 2px",
              }}
              // inputFocusStyle={{ borderColor: "#4E0D0E" }}
              ref={(p) => (pin = p)}
              onComplete={(value: string, index: number) => {
                handleOTPCheck(value);
              }}
              autoSelect={true}
              regexCriteria={/^[ A-Za-z0-9_@./#&+-]*$/}
            />
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Box>
            {fetcher?.state === "idle" &&
            fetcher?.data?.error?.error?.message ? (
              <Typography
                variant="body1"
                sx={{
                  fontSize: "16px",
                  textAlign: "center",
                  direction: "ltr",
                  captionSide: "bottom",
                  color: "#dd2c00",
                  my: 1,
                }}
              >
                {fetcher?.data?.error?.error?.message}
              </Typography>
            ) : (
              ""
            )}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <LoadingButton
            size="large"
            onClick={() => handleOTPCheck(state.otp)}
            endIcon={<SendIcon />}
            loading={
              state.sendOTP &&
              (fetcher.state === "submitting" || navigation.state === "loading")
            }
            loadingPosition="end"
            variant="text"
            type="submit"
            fullWidth
            disabled={state.otp.length !== 4}
            sx={{
              width: "100%",
              height: { xs: "3rem", md: "3.75rem" },
              background: "#601E1D",
              borderRadius: "29px",
              fontSize: "20px",
              color: "#fff",
              ":hover": {
                background: "#3D0505",
              },
              "&.MuiLoadingButton-root": {
                color: "white",
                display: "flex",
                justifyContent: "center",
              },
            }}
          >
            {state.sendOTP &&
            (fetcher.state === "submitting" || navigation.state === "loading")
              ? "Verifying"
              : "Verify"}
          </LoadingButton>
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{
              direction: "ltr",
              margin: "20px 0 0",
              textAlign: "center",
              color: "rgba(0,0,0,.38)",
            }}
          >
            <Countdown
              date={Date.now() + 20000}
              renderer={Renderer}
              key={Date.now()}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const Reward = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        flexDirection: "column",
        my: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          p: 4,
          background: "#FAFAFA",
          borderRadius: "10px",
          mt: 5,
        }}
      >
        <Typography
          variant="h6"
          component="h6"
          textAlign="center"
          sx={{ fontWeight: "700" }}
        >
          {loaderData?.data?.client?.name}
        </Typography>
        <Typography
          variant="h5"
          component="h6"
          textAlign="center"
          sx={{ fontWeight: "700" }}
        >
          {loaderData?.data?.client?.promotionText}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={SewasewBlackLogo}
            height="65px"
            width="65px"
            alt="sewasew logo"
            style={{
              cursor: "pointer",
            }}
          />
          <Lottie
            animationData={rewardAnimation}
            loop={true}
            style={{
              width: "130px",
              marginLeft: 2,
            }}
          />
        </Box>
        <Typography
          variant="subtitle1"
          component="h6"
          textAlign="center"
          sx={{ fontWeight: "700" }}
        >
          {loaderData?.data?.client?.name} has gifted you
        </Typography>
        <Typography
          variant="subtitle1"
          component="h6"
          textAlign="center"
          sx={{ fontWeight: "700" }}
        >
          A <strong>{loaderData?.data?.plan}</strong> of sewasew free service in
          appreciation.
        </Typography>
      </Box>
      <Box
        sx={{
          font: "normal normal 300 20px/27px Roboto",
          letterSpacing: " 0.6px",
          color: " #000000",
          textAlign: "center",
          p: 4,
        }}
      >
        <Typography gutterBottom variant="h5" sx={{ fontWeight: 700 }}>
          Get Sewasew App now
        </Typography>

        <Typography sx={{ mb: 2 }} variant="subtitle2">
          Download Sewasew Mobile App from Play store or Appstore & <br />
          get unlimited access to all the music
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            pb: 0,
            mb: 0,
          }}
        >
          <Download ENV={ENV} display="row" />
        </Box>
      </Box>
    </Box>
  );

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
        {!!loaderData?.data?.rewarded || !!fetcher?.data?.data?.rewarded ? (
          <Box
            sx={{
              position: "absolute" as "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "100%", sm: "70%" },
              background: "#FFFFFF",
              boxShadow: "0px 3px 6px #00000029",
              borderRadius: "10px",
              textAlign: "end",
              color: "primary.main",
              zIndex: 999,
            }}
          >
            {Reward}
          </Box>
        ) : !!loaderData?.data?.submit ||
          !!fetcher?.data?.data?.submit ||
          !!loaderData?.data?.retry ||
          !!fetcher?.data?.data?.retry ? (
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
              actionData={actionData}
              fetcher={fetcher}
              loaderData={
                loaderData?.data?.submit
                  ? loaderData?.data
                  : fetcher?.data?.data?.data
              }
              navigation={navigation}
            />
          </Box>
        ) : !state.sendOTP ? (
          SendOTP
        ) : (
          Verify
        )}
      </Box>
    </Stack>
  );
};

export default SubmitForm;
