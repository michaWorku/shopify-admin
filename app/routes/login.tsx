import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { EthiopianMusicStreamingAppForAll } from "public/assets";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction} from "@remix-run/node";
import {
  json,
  redirect,
} from "@remix-run/node";
import type { TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SubmitHandler} from "react-hook-form";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { signinSchema } from "~/utils/validations";
import { USER_LOGIN, authenticator } from "~/services/auth.server";
import { destroySession, getSession } from "~/services/session.server";
import { toast } from "react-toastify";

type signinInput = TypeOf<typeof signinSchema>;

export const action: ActionFunction = async ({  request  }) => {
  return await authenticator.authenticate(USER_LOGIN, request, {
    successRedirect: "/clients",
    throwOnError: true,
    failureRedirect: "/login",
  });
};

type LoaderData = {
  error?: {
    formError: string[];
  };
};

export const loader: LoaderFunction = async ({  request  }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/clients",
  });
  let session = await getSession(request.headers.get("cookie"));
  let error = session.get(authenticator.sessionErrorKey) as Error[] | Error;
  console.log({ error });
  if (error) {
    return json(
      {
        error: {
          formError:
            "Unable to login with those credentials, please try again!",
        },
      },
      {
        headers: {
          "Set-Cookie": await destroySession(session),
        },
      }
    );
  } else {
    return {};
  }
};

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};
const Login = ()  => {
  const [showPassword, setShowPassword] = useState(false);
  
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/support";
  const loaderData = useLoaderData() as LoaderData;

  useEffect(() => {
    if (loaderData?.error?.formError) {
      toast.error(loaderData?.error?.formError, {
        position: toast.POSITION.BOTTOM_LEFT
      });
    }
  }, [loaderData]);

  const submit = useSubmit();
  const {
    register,
    formState: { errors, isSubmitSuccessful },
    reset,
    handleSubmit,
  } = useForm<signinInput>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmitHandler: SubmitHandler<signinInput> = (values) => {
    submit(values, { method: "post", action: "/login" });
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    
    event: React.MouseEvent<HTMLButtonElement>
  
  ) => {
    event.preventDefault();
  };

  return (
    <Stack direction="row" spacing={2}>
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
          width: "427px",
          height: "550px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ p: { sm: 4, md: 2, lg: 4 }, m: { xs: 2, sm: 6, md: 2 } }}>
          <Typography
            variant="h4"
            component="h3"
            sx={{ m: { xs: "1rem 0", sm: "1.5rem 0", md: "2rem 0" } }}
          >
            Login
          </Typography>
          <Form method="post" onSubmit={handleSubmit(onSubmitHandler)}>
            <Box
              sx={{
                width: "95%",
                alignSelf: "center",
                "& .MuiTextField-root": { my: 1 },
                "& .MuiInputLabel-root": {
                  color: "primary.main",
                  fontSize: "1rem",
                  fontWeight: "400",
                },
              }}
            >
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                {...register("email")}
                error={!!errors["email"]}
                helperText={errors["email"] ? errors["email"].message : ""}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                {...register("password")}
                error={!!errors["password"]}
                helperText={
                  errors["password"] ? errors["password"].message : ""
                }
                InputProps={{
                  endAdornment: (
                    (
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
                  )
                  ),
                }}
              />
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ p: 2, mt: 2, borderRadius: "2rem" }}
              >
                Login
              </Button>
              <Link to="/reset">
                <Typography
                  variant="body1"
                  component="h6"
                  marginTop={2}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "underline",
                  }}
                >
                  Forgot password?
                </Typography>
              </Link>
              {/* <Typography
                variant="body1"
                component="h6"
                marginTop={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Don't have an account?
                <Link
                  to={{
                    pathname: "/signup",
                    search: searchParams.toString(),
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    component="h6"
                    marginLeft={1}
                  >
                    Signup
                  </Typography>
                </Link>
              </Typography> */} 
            </Box>
          </Form>
        </Box>
      </Box>
    </Stack>
  );
};

export default Login;
