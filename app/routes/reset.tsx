import {
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { EthiopianMusicStreamingAppForAll } from "public/assets";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { resetSchema } from "~/utils/validations";
import PinInput from "react-pin-input";
import Countdown from "react-countdown-now";
import { LoadingButton } from "@mui/lab";
import customErr, {
  badRequest,
  errorHandler,
  ResponseType,
} from "~/utils/handler.server";
import { createOTP, verifyOTP } from "~/services/otp.server";
import { checkUserExists, updatePassword } from "~/services/User/users.server";
import { toast } from "react-toastify";
import {
  commitSession,
  destroySession,
  getSession,
} from "~/services/session.server";

type resetInput = TypeOf<typeof resetSchema>;

export const meta: MetaFunction = () => {
  return {
    title: "Reset Password",
  };
};

export const loader: LoaderFunction=({request})=>{
  return null
}

export const action: ActionFunction = async ({ request }) => {
  try {
    console.log({ start: new Date() });
    const session = await getSession(request.headers.get("Cookie"));
    const formData = await request.formData();
    let phone = formData.get("phone");

    if (typeof phone === "string") {
      if (!phone || phone.length >= 13 || phone.length <= 8) {
        return json<ResponseType>({
          error: {
            fieldError: {
              phone: "Inter a valid phone number",
            },
          },
        });
      }
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
      const userExists = await checkUserExists('phone', phone);

      if (!userExists) {
        return badRequest<ResponseType>({
          error: {
            error: {
              message: "User not found",
            },
          },
        });
      }

      switch (request.method) {
        case "POST":
          const fullHash = await createOTP(phone);
          console.log({ phone, fullHash });
          
          if (!!fullHash?.data){
            session.set("hash", fullHash?.data?.fullHash);
            return json<ResponseType>(
              { data:{phone: fullHash?.data?.phone} },
              {
                headers: {
                  "Set-Cookie": await commitSession(session),
                },
              }
            );
          }
          return badRequest({ ...fullHash });
        case "PUT":
          const otp = formData.get("otp");
          const hash = session.get("hash");
          if (!!hash && typeof otp === "string") {
            console.log({ phone, hash, otp });
            const verified = verifyOTP(phone, hash, otp);

            if (verified) {
              session.set("hash", { phone, hash, otp });
              return json<ResponseType>(
                {
                  data: { message: "OTP has verified", phone },
                },
                {
                  headers: {
                    "Set-Cookie": await commitSession(session),
                  },
                }
              );
            }
          }
          throw new customErr("Custom_Error", "Invalid or Expired OTP", 400);
        case "PATCH":
          const newPassword = formData.get("newPassword");
          const confirmPassword = formData.get("confirmPassword");
          const sessionHash = session.get("hash");
          console.log({ sessionHash, newPassword, confirmPassword });
          if (phone !== sessionHash?.phone || !sessionHash) {
            return json<ResponseType>(
              {
                error: {
                  error: {
                    message: "You are not allowed to reset password",
                  },
                },
              },
              {
                headers: {
                  "Set-Cookie": await destroySession(session),
                },
                status: 403,
              }
            );
          } else {
            if (
              typeof newPassword === "string" &&
              newPassword == confirmPassword
            ) {
              console.log({ update: new Date() });
              const user = await updatePassword(phone, newPassword);
              console.log({ afterDB: new Date() });
              if (user) {
                return redirect("/login", {
                  headers: {
                    "Set-Cookie": await destroySession(session),
                  },
                });
              } else {
                throw new customErr(
                  "Custom_Error",
                  "Something went wrong, Please contact support!",
                  400
                );
              }
            }
            throw new customErr("Custom_Error", "Password don't match", 400);
          }
        default:
          throw new customErr(
            "Custom_Error",
            "Something went wrong, Please contact support!",
            400
          );
      }
    } else {
      throw new customErr("Custom_Error", "Invalid phone number", 400);
    }
  } catch (error) {
    return errorHandler(error);
  }
};

const Reset = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState({ phone: "", otp: "", sendOTP: false });
  let pin: any;
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/login";
  const actionData = useActionData();
  const submit = useSubmit();
  const fetcher = useFetcher();

  const {
    register,
    formState: { errors, isSubmitSuccessful, isSubmitting },
    reset,
    handleSubmit,
  } = useForm<resetInput>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    console.log({ actionData });
    if (actionData?.error?.error?.message) {
      toast.error(actionData?.error?.error?.message);
    }

    if (actionData?.data?.phone) {
      setState((prev) => ({ ...prev, sendOTP: true }));
    }
  }, [actionData]);

  const onSubmitHandler: SubmitHandler<resetInput> = (values) => {
    submit({ ...values, phone: actionData?.data?.phone }, { method: "patch" });
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleOTPChange = (value: string, index: number) => {
    if (fetcher?.data?.error?.error?.message)
      fetcher.data.error.error.message = null;
    setState((prev) => ({ ...prev, otp: value }));
  };

  const handleOTPCheck = async (otp: string) => {
    fetcher.submit(
      {
        phone: state.phone,
        otp,
      },
      { method: "put" }
    );
  };

  const SendOTP = (
    <Box
      sx={{
        width: "95%",
        "& .MuiTextField-root": { my: 1 },
        "& .MuiInputLabel-root ": {
          color: "primary.main",
          fontSize: "1rem",
          fontWeight: "400",
        },
        "& .MuiTypography-root": {
          color: "primary.main",
        },
      }}
    >
      <Form method="post" action="/reset">
        <Typography
          variant="h4"
          component="h3"
          sx={{ m: { xs: "1rem 0", sm: "1.5rem 0", md: "2rem 0" } }}
        >
          Forgot Passowrd
        </Typography>
        <TextField
          type="tel"
          required
          label="Phone"
          variant="outlined"
          fullWidth
          color="primary"
          name="phone"
          value={state.phone}
          onChange={(e) => {
            setState((prev) => ({ ...prev, phone: e.target.value }));
          }}
          error={!!actionData?.error?.fieldError?.phone}
          helperText={actionData?.error?.fieldError?.phone}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ color: "primary.main" }}>
                +251
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ p: 2, mt: 2, borderRadius: "2rem" }}
        >
          {isSubmitting ? "Sending..." : "Send OTP"}
        </Button>
      </Form>
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
          onClick={(e) => {
            pin.clear();
            fetcher.submit(
              {
                phone: state.phone,
              },
              { method: "post" }
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
          {state?.phone}
        </Typography>
        <EditIcon
          onClick={() => setState((prev) => ({ ...prev, sendOTP: false }))}
        />
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
            // secret
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
          {fetcher?.state === "idle" && fetcher?.data?.error?.error?.message ? (
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
            fetcher.state === "submitting" || fetcher.state === "loading"
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
          {fetcher.state === "submitting" || fetcher.state === "loading"
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
  );

  const ResetPassword = (
    <Form method="patch" onSubmit={handleSubmit(onSubmitHandler)}>
      <Box
        sx={{
          width: "95%",
          "& .MuiTextField-root": { my: 1 },
          "& .MuiInputLabel-root ": {
            color: "primary.main",
            fontSize: "1rem",
            fontWeight: "400",
          },
          "& .MuiTypography-root": {
            color: "primary.main",
          },
        }}
      >
        <Typography
          variant="h4"
          component="h3"
          sx={{ m: { xs: "1rem 0", sm: "1.5rem 0", md: "2rem 0" } }}
        >
          Reset Passowrd
        </Typography>
        <TextField
          required
          label="New Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          {...register("newPassword")}
          error={!!errors["newPassword"]}
          helperText={
            errors["newPassword"] ? errors["newPassword"].message : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          required
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          variant="outlined"
          fullWidth
          {...register("confirmPassword")}
          error={!!errors["confirmPassword"]}
          helperText={
            errors["confirmPassword"] ? errors["confirmPassword"].message : ""
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ p: 2, mt: 2, borderRadius: "2rem" }}
        >
          Reset Password
        </Button>
      </Box>
    </Form>
  );

  return (
    <Stack direction="row" sx={{ minHeight: "100vh", minWidth: "100vw" }}>
      <Box sx={{ flex: 2, display: { xs: "none", md: "block" } }}>
        <img
          src={EthiopianMusicStreamingAppForAll}
          alt="sewasew"
          height="100%"
          width="100%"
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            p: { xs: 6, sm: 4, md: 3, lg: 5 },
            width: { xs: "100%", sm: "60%", md: "100%" },
            mt: 14,
            mx: 2,
            background: "#FAFAFA",
            boxShadow: "0px 3px 6px #00000029",
            borderRadius: "10px",
            alignSelf: "start",
            color: "primary.main",
          }}
        >
          {
          !state.sendOTP
            ?SendOTP
            : fetcher?.data?.data?.message === "OTP has verified"
            ? ResetPassword
            : Verify
            }
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Typography
            variant="body1"
            component="h6"
            marginTop={2}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Remember password?
            <Link
              to={{
                pathname: "/Login",
                search: searchParams.toString(),
              }}
            >
              <Typography
                variant="subtitle1"
                color="primary"
                component="h6"
                marginLeft={1}
              >
                Login
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};

export default Reset;
