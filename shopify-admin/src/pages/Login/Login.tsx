import { FC } from "react";
import "./login.scss";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login, reset } from "../../features/auth/authSlice";
import { Spinner } from "../../components";
import { useAppDispatch, useAppSelector } from "../../app/hooks";

const Login: FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth.auth
  );

  useEffect(() => {
    if (isError) {
      toast.error(message);
    }

    if (isSuccess || user) {
      navigate("/");
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };
    //@ts-ignore
    dispatch(login(userData));
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="center-item">
		<form onSubmit={onSubmit}>
      <input
          type="email"
          id="email"
          name="email"
          value={email}
          placeholder="Enter your email"
          onChange={onChange}
        />
		  <input
          type="password"
          id="password"
          name="password"
          value={password}
          placeholder="Enter password"
          onChange={onChange}
        />
			<button type="submit">Login</button>
			<p>Not Registered ?<a href="#">Create account Now!</a></p>
		</form>

	</div>
  )
};

export default Login;
