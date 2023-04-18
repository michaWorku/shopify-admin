import type { FC } from "react";
import { UserAgentProvider, UserAgent } from "@quentin-sommer/react-useragent";
import Link from "@mui/material/Link";
import { AppStoreIcon, GooglePlayStoreIcon } from "public/assets";
import { Box, Grid } from "@mui/material";

interface MyWindow extends Window {
  navigator: any;
}

declare var window: MyWindow;

interface DownloadProps {
  ENV: {
    REACT_APP_DOWNLOAD_IOS: string;
    REACT_APP_DOWNLOAD_ANDROID: string;
  };
  display: string;
}

/**
 * Download component that renders a grid of download links for the App Store and Google Play Store.
 * @param {Object} DownloadProps - Component props.
 * @param {Object} DownloadProps.ENV - Object containing environment variables.
 * @param {string} DownloadProps.display - The direction of the container's main axis, either 'row' or 'column'.
 * @returns {JSX.Element} - Returns the Download component.
*/
const Download: FC<DownloadProps> = ({ ENV, display }) => {
  if (typeof window !== "undefined") {
    return (
      <>
        <UserAgentProvider ua={window?.navigator?.userAgent}>
          <>
            <UserAgent computer>
              <Grid
                container
                sx={{
                  diplay: "flex",
                  flexDirection: display,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                spacing={1}
              >
                <Grid item sx={{ p: 0 }}>
                  <Box sx={{ display: "inline-block" }}>
                    <Link
                      href={ENV.REACT_APP_DOWNLOAD_IOS}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        height="50px"
                        src={AppStoreIcon}
                        alt="Download on the App Store"
                        title="Download on the App Store"
                      />
                    </Link>
                  </Box>
                </Grid>
                <Grid item xs>
                  <Box sx={{ display: "inline-block" }}>
                    <Link
                      href={ENV.REACT_APP_DOWNLOAD_ANDROID}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        height="50px"
                        src={GooglePlayStoreIcon}
                        alt="Get it on Google Play"
                        title="Get it on Google Play"
                      />
                    </Link>
                  </Box>
                </Grid>
              </Grid>
            </UserAgent>
            <UserAgent ios>
              <Link
                sx={{
                  display: "inline-block",
                }}
                href={ENV.REACT_APP_DOWNLOAD_IOS}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  height="50px"
                  src={AppStoreIcon}
                  alt="Download on the App Store"
                  title="Download on the App Store"
                />
              </Link>
            </UserAgent>
            <UserAgent android>
              <Link
                sx={{
                  display: "inline-block",
                }}
                href={ENV.REACT_APP_DOWNLOAD_ANDROID}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  height="50px"
                  src={GooglePlayStoreIcon}
                  alt="Get it on Google Play"
                  title="Get it on Google Play"
                />
              </Link>
            </UserAgent>
          </>
        </UserAgentProvider>
      </>
    );
  } else {
    return <></>;
  }
};

export default Download;
