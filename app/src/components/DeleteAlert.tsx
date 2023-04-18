import { Box, CircularProgress } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { useFetcher } from "@remix-run/react";
import type { Dispatch, FC, SetStateAction } from "react";
import { forwardRef } from "react";
import palette from "../theme/palette";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export type DeleteDialogType = {
  title?: string;
  contentText?: string;
  open: boolean;
  id: string;
  action: string;
};

type DeleteAlertProps = {
  deleteDialog: DeleteDialogType;
  setDeleteDialog: Dispatch<SetStateAction<DeleteDialogType>>;
  fetcher: any;
};

/**
 * Represents a dialog box for confirming deletion.
 * @component DeleteAlert
 * @name DeleteAlert
 * @param {Object} props - The props object.
 * @param {Object} props.deleteDialog - An object containing the details of the dialog box.
 * @param {Function} props.setDeleteDialog - A function to set the state of deleteDialog.
 * @param {Object} props.fetcher A fetcher instance to handle API calls.
 * @returns {JSX.Element} - A JSX Element representing the DeleteAlert component.
 * @returns
 */
const DeleteAlert: FC<DeleteAlertProps> = ({
  deleteDialog,
  setDeleteDialog,
  fetcher,
}): JSX.Element => {
  const handleCloseDialog = () => {
    setDeleteDialog({
      open: false,
      id: "",
      title: "",
      contentText: "",
      action: "",
    });
  };

  return (
    <div>
      <Dialog
        open={deleteDialog?.open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDialog}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiDialog-paper": {
            p: { xs: 0, sm: 2 },
            m: 2,
            pb: 1,
          },
        }}
      >
        <DialogTitle variant="subtitle1" fontSize="1.1rem" fontWeight={900}>
          {deleteDialog?.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-slide-description"
            sx={{ color: "black" }}
          >
            {deleteDialog?.contentText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{
              backgroundColor: "#e5e5e5",
              fontSize: "0.875rem",
              width: "7rem",
              height: "2.2rem",
              color: "primary.main",
              ":hover": {
                backgroundColor: "#e5e5e5",
                color: "primary.main",
              },
            }}
            type="button"
          >
            Close
          </Button>
          <Box px={0.5} />
          <Button
            sx={{
              color: "primary.main",
              backgroundColor: "secondary.main",
              fontSize: "0.875rem",
              width: "7rem",
              height: "2.2rem",
              ":hover": {
                backgroundColor: "primary.main",
                color: '#fff'
              },
            }}
            type="button"
            disabled={
              fetcher.state === "submitting" || fetcher.state === "loading"
            }
            onClick={() =>
              fetcher.submit(
                {},
                {
                  method: "delete",
                  action: deleteDialog?.action,
                }
              )
            }
          >
            {fetcher.state === "submitting" || fetcher.state === "loading" ? (
              <CircularProgress size="1rem" />
            ) : (
              "Continue"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DeleteAlert;
