import {
  Box,
  Button,
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
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { EthiopianMusicStreamingAppForAll } from "public/assets";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import { getUserId, createUserSession } from "~/session.server";
// import { createUser, getUserByEmail } from "~/models/user.server";
// import { safeRedirect, validateEmail } from "~/utils/user";
import {
  ActionFunction,
  json,
  LoaderFunction,
  MetaFunction,
  redirect,
} from "@remix-run/node";
import { badRequest } from "~/utils/utils-server";
import { addUserSchema, signupSchema } from "~/utils/validations";
import { checkUserExists, createUser } from "~/services/User/users.server";
import { SubmitHandler, useForm } from "react-hook-form";
import { TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { authenticator } from "~/services/auth.server";
import { destroySession, getSession } from "~/services/session.server";
import { toast } from "react-toastify";

type signupInput = TypeOf<typeof addUserSchema>;

type ActionData = {
  error?: {
    formError?: string;
    fieldErrors?: {
      email?: string[];
      password?: string[];
      firstName?: string[];
      middleName?: string[];
      lastName?: string[];
      phone?: string[];
    };
  };
  fields?: {
    email: string;
    password: string;
    firstName: string;
    middleName: string;
    lastName: string;
    phone: string;
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  return await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
    successRedirect: "/login"
  });
};

export const action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("cookie"));
  const form = await request.formData();
  const firstName = form.get("firstName");
  const middleName = form.get("middleName");
  const lastName = form.get("lastName");
  const email = form.get("email");
  const phone = form.get("phone");
  const password = form.get("password");

  if (
    typeof firstName !== "string" ||
    typeof middleName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof password !== "string"
  ) {
    return badRequest<ActionData>({
      error: { formError: `Form not submitted correctly.` },
    });
  }

  const fields = { firstName, middleName, lastName, email, phone, password };

  const result = addUserSchema.safeParse(fields);

  if (!result.success) {
    const error = result.error.flatten();

    return badRequest<ActionData>({ fields, error });
  }

  const userExists = await checkUserExists('email',result.data.email);

  if (userExists) {
    return badRequest<ActionData>({
      fields,
      error: { formError: `User with ${email} already exists` },
    });
  }

  const user = await createUser(result.data);

  console.log({ user });

  if (user) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  } else {
    return badRequest<ActionData>({
      fields,
      error: { formError: `Something went wrong, please contact support.` },
    });
  }
};
export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  };
};

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef();;
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? undefined;
  const actionData = useActionData() as ActionData;


  useEffect(() => {
    if (actionData?.error?.formError) {
      toast.error(actionData?.error?.formError);
    }
  }, [actionData]);

  const submit = useSubmit();
  const {
    register,
    formState: { errors, isSubmitSuccessful },
    reset,
    handleSubmit,
  } = useForm<signupInput>({
    resolver: zodResolver(addUserSchema),
  });

  const onSubmit = (event: any) => {
    event.preventDefault();
    const formData = new FormData(formRef.current!);
    console.log({ formData, email: formData.get("email") });
    // formData.set("arbitraryData", post.title)

    // submit(
    //   formData, //Notice this change
    //   { method: "post", action: "/login" }
    // );
  };
  const onSubmitHandler: SubmitHandler<signupInput> = (values) => {
    console.log({  values  });
    submit(
      values, //Notice this change
      { method: "post", action: "/signup" }
    );
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
            Create account
          </Typography>
          <Form method="post" onSubmit={handleSubmit(onSubmitHandler)}>
            <Box
              // component='form'
              // noValidate
              // autoComplete='off'
              // onSubmit={handleSubmit(onSubmitHandler)}
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
                  fontSize: "1rem",
                  fontWeight: "400",
                },
              }}
            >
              <TextField
                required
                label="First Name"
                variant="outlined"
                fullWidth
                color="primary"
                // error={Boolean(actionData?.errors?.firstName)}
                // helperText={actionData?.errors?.firstName}
                {...register("firstName")}
                error={!!errors["firstName"]}
                helperText={
                  errors["firstName"] ? errors["firstName"].message : ""
                }
              />
              <TextField
                required
                label="Middle Name"
                variant="outlined"
                fullWidth
                color="primary"
                // error={Boolean(actionData?.errors?.firstName)}
                // helperText={actionData?.errors?.firstName}
                {...register("middleName")}
                error={!!errors["middleName"]}
                helperText={
                  errors["middleName"] ? errors["middleName"].message : ""
                }
              />
              <TextField
                required
                label="Last Name"
                variant="outlined"
                fullWidth
                color="primary"
                // error={Boolean(actionData?.errors?.lastName)}
                // helperText={actionData?.errors?.lastName}
                {...register("lastName")}
                error={!!errors["lastName"]}
                helperText={
                  errors["lastName"] ? errors["lastName"].message : ""
                }
              />
              <TextField
                required
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                // error={Boolean(actionData?.errors?.email)}
                // helperText={actionData?.errors?.email}
                {...register("email")}
                error={!!errors["email"]}
                helperText={errors["email"] ? errors["email"].message : ""}
              />
              <TextField
                required
                label="Phone"
                variant="outlined"
                fullWidth
                color="primary"
                {...register("phone")}
                error={
                  !!errors["phone"]
                  // ||
                  // !!actionData?.error?.fieldErrors?.find(
                  //   (err: any) => err?.name === "phone"
                  // )
                }
                helperText={
                  errors["phone"]
                    ? errors["phone"].message
                    : // : !!actionData?.error?.fieldErrors?.find(
                      //     (err: any) => err?.name === "phone"
                      //   )
                      // ? actionData?.error?.fieldErrors?.find(
                      //     (err: any) => err?.name === "phone"
                      //   )?.description
                      ""
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: "red" }}>
                      +251
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                // name='password'
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                {...register("password")}
                // error={Boolean(actionData?.errors?.password)}
                // helperText={actionData?.errors?.password}
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
                Create Account
              </Button>
              <Typography
                variant="overline"
                component="h6"
                marginTop={2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Aleady have an account?
                <Link
                  to={{
                    pathname: "/login",
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
          </Form>
        </Box>
      </Box>
    </Stack>
  );
};

export default Signup;
