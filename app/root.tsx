import * as React from "react";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLocation,
} from "@remix-run/react";
import { withEmotionCache } from "@emotion/react";
import {
  CssBaseline,
  unstable_useEnhancedEffect as useEnhancedEffect,
} from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import tostify from "react-toastify/dist/ReactToastify.css";
import ClientStyleContext from "./src/context/ClientStyleContext";
import ThemeConfig from "./src/theme";
import GlobalStyles from "./src/theme/GlobalStyles";
import { Layout } from "./src/components";

export const links = () => {
  return [
    {
      rel: "stylesheet",
      href: tostify,
    },
  ];
};
interface DocumentProps {
  children: React.ReactNode;
  title?: string;
}

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const clientStyleData = React.useContext(ClientStyleContext);

    // Only executed on client
    useEnhancedEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        // eslint-disable-next-line no-underscore-dangle
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="assets/sewasew_music_streaming_favicon-32x32.png"
          />
          <meta
            name="emotion-insertion-point"
            content="emotion-insertion-point"
          />
        </head>
        <body>
          {children}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
          {/* <ToastContainer/> */}
        </body>
      </html>
    );
  }
);

// https://remix.run/api/conventions#default-export
// https://remix.run/api/conventions#route-filenames
export default function App() {
  const location = useLocation();
  return (
    <ThemeConfig>
      <GlobalStyles />
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} sx={{ color: "primary.main" }}>
        <Document>
          {["submit", "login", "signup", "reset"].some((keyword) =>
            location.pathname.split("/").includes(keyword)
          ) ? (
            <Outlet />
          ) : (
            <Layout>
              <Outlet />
            </Layout>
          )}
          <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Document>
      </LocalizationProvider>
    </ThemeConfig>
  );
}

// https://remix.run/docs/en/v1/api/conventions#errorboundary
export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <ThemeConfig>
      <GlobalStyles />
      <CssBaseline />
      <Document title="Error!">
        {/* <Layout> */}
        <div style={{ padding: 3, margin: 13 }}>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
        </div>
        {/* </Layout> */}
      </Document>
    </ThemeConfig>
  );
}

// https://remix.run/docs/en/v1/api/conventions#catchboundary
export function CatchBoundary() {
  const caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = "Sorry, you don't have acces to visit the page.";
      break;
    case 404:
      message = "Sorry, the page you were trying to reach doesn't exist.";
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <ThemeConfig>
      <GlobalStyles />
      <CssBaseline />
      <Document title={`${caught.status} ${caught.statusText}`}>
        {/* <Layout> */}
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
        {/* </Layout> */}
      </Document>
    </ThemeConfig>
  );
}
