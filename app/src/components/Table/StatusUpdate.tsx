import { useState } from "react";
import PropTypes from "prop-types";
import { Box, Switch, Tooltip, Typography } from "@mui/material";
import {
  Done,
  ReportGmailerrorred,
  PendingOutlined,
} from "@mui/icons-material";
import { useNavigation, useSubmit } from "@remix-run/react";

/**
 * Component StatusUpdate
 * Renders a component for updating the status of a row.
 * @param {object} props - The props object.
 * @param {object} props.row - The row object.
 * @param {string} props.route - The route URL.
 * @param {boolean} props.disable - A flag indicating whether to disable the component.
 */
const StatusUpdate = ({ row, route, disable }: any): JSX.Element => {
  const submit = useSubmit();
  const navigation = useNavigation();

  const getStatusIcon = () => {
    if (row.original.status === "PENDING") {
      return <PendingOutlined color="warning" />;
    }

    if (
      ["INACTIVE", "REJECTED", "FAILED", "NOTPAID"].includes(
        row.original.status
      )
    ) {
      return <ReportGmailerrorred color="error" />;
    }

    return <Done color="success" />;
  };

  const getStatusColor = () => {
    if (
      ["VERIFIED", "APPROVED", "SUCCESS", "PAID"].includes(row.original.status)
    ) {
      return "primary.lighter";
    }

    if (
      row.original.status === "REJECTED" ||
      row.original.status === "FAILED" ||
      row.original.status === "NOTPAID"
    ) {
      return "error.lighter";
    }

    return "warning.lighter";
  };

  return (
    <Box
      sx={{
        ...(disable && { pointerEvents: "none" }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          px: 1,
          alignItems: "center",
          width: 190,
          borderRadius: 1,
          bgcolor:
            row?.original?.status === "ACTIVE"
              ? "success.lighter"
              : "error.lighter",
        }}
      >
        {getStatusIcon()}
        <Typography color={getStatusColor()} sx={{ px: 1 }}>
          {row.original.status}
        </Typography>
        {(row.original.status === "ACTIVE" ||
          row.original.status === "INACTIVE") && (
          <Tooltip arrow placement="left" title="Change Status">
            <Switch
              checked={row.original.status === "ACTIVE"}
              color={row.original.status === "ACTIVE" ? "success" : "error"}
              disabled={navigation.state === "submitting"}
              onChange={() =>
                submit(
                  {
                    data: JSON.stringify({
                      status:
                      row.original.status === 'ACTIVE'
                          ? 'INACTIVE'
                          : 'ACTIVE'
                    })
                  },
                  {
                    method: "patch",
                    action: route,
                  }
                )
              }
            />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export default StatusUpdate;
