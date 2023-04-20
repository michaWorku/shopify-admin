import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Form, useSubmit, useTransition } from "@remix-run/react";
import { useState } from "react";

export default function AddRoleForm({
  handleCloseModal,
  loaderData,
  actionData,
}: any) {
  const submit = useSubmit();
  const transition = useTransition();
  let transitionData: any;
  transition?.submission?.formData
    ? (transitionData = Object.fromEntries(transition?.submission?.formData))
    : (transitionData = "");
  const [name, setName] = useState("");
  const [permissionIds, setPermissionIds] = useState([]) as any;

  const systemPermission = loaderData?.data?.systemPermissions?.data;
  const clients = loaderData?.data?.entities?.clients?.entities?.data;
  const entityPermissions =
    loaderData?.data?.entities?.clients?.entityPermissions.data;

  function handleSubmit() {
    submit(
      {
        name,
        permissions: JSON.stringify(permissionIds),
        clientId: clients?.id,
      },
      { method: "post" }
    );
  }

  const categorizePermissions = (rawPermissions: []) => {
    const permissions = rawPermissions?.reduce(function (
      permissions: any,
      permission: any
    ) {
      if (permission?.category in permissions) {
        permissions[permission?.category]?.push(permission);
      } else {
        permissions[permission?.category] = [permission];
      }
      return permissions;
    },
    {});
    return permissions;
  };

  const systemPermissionsIds = systemPermission?.map(
    (permission: any) => permission?.id
  );
  const clientPermissionsIds = entityPermissions?.map(
    (permission: any) => permission?.id
  );

  let systemPermissions: any;
  if (systemPermission) {
    systemPermissions = categorizePermissions(systemPermission);
  }
  let clientPermissions: any;
  if (entityPermissions) {
    clientPermissions = categorizePermissions(entityPermissions);
  }
  console.log({ permissionIds });

  return (
    <Form>
      <Box sx={{ px: 4 }}>
        <Box sx={{ height: { xs: 170, sm: 100, bgcolor: "#fafafa" } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ px: 5, pt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add New Role
              </Typography>
              <Typography variant="body2">
                Add new roles with the permissions below
              </Typography>
            </Box>
            <Box
              sx={{
                pr: 3,
                pt: 3,
              }}
            >
              <IconButton onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        <Divider />
        <Box>
          <Grid container>
            <Grid xs={12} sm={7} md={8} sx={{ p: 1 }}>
              <TextField
                placeholder="Role Name"
                type="text"
                label="Role Name"
                sx={{
                  my: 2,
                  width: { md: 500 },
                }}
                onChange={(e) => setName(e.target.value)}
                helperText={
                  actionData?.error?.fieldError &&
                  actionData?.error?.fieldError[0]?.fieldErrors?.name
                    ? actionData?.error?.fieldError[0].fieldErrors?.name[0]
                    : undefined
                }
                error={
                  actionData?.error?.fieldError &&
                  actionData?.error?.fieldError[0]?.fieldErrors.name
                }
              />
              <Box
                sx={{
                  overflowY: "auto",
                  "&::-webkit-scrollbar": {
                    width: 0,
                  },
                  height: "calc(100vh - 300px)",
                }}
              >
                {systemPermissions && <Typography>System</Typography>}
                {systemPermissions && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>System Permissions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControlLabel
                        control={
                          <Tooltip
                            arrow
                            placement="bottom"
                            title={`Select All System permissions`}
                          >
                            <Checkbox
                              checked={systemPermission.every((item: any) => {
                                return permissionIds.includes(item.id);
                              })}
                              onChange={() => {
                                let systemPermissionIds: string[] = [];
                                Object.keys(systemPermissions)?.map((item) => {
                                  systemPermissions[item].map((elt: any) => {
                                    systemPermissionIds.push(elt.id);
                                    return systemPermissionIds;
                                  });
                                  return systemPermissionIds;
                                });
                                if (
                                  systemPermissionIds.every((element) => {
                                    return permissionIds.includes(element);
                                  })
                                ) {
                                  setPermissionIds((state: any) => [
                                    ...state.filter(
                                      (el: any) =>
                                        !systemPermissionIds.includes(el)
                                    ),
                                  ]);
                                } else {
                                  const unselected = systemPermissionIds.filter(
                                    (e) => permissionIds.indexOf(e) < 0
                                  );
                                  setPermissionIds((state: any) => [
                                    ...state,
                                    ...unselected,
                                  ]);
                                }
                              }}
                            />
                          </Tooltip>
                        }
                        label="All System Permissions"
                      />
                      {Object.keys(systemPermissions)?.map((category) => {
                        return (
                          <Box
                            key={category}
                            sx={{
                              mx: 3,
                              mt: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "bold",
                              }}
                            >
                              {category}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                              }}
                            >
                              {systemPermissions[category]?.map(
                                (permission: any) => {
                                  if (permission?.canCreate) {
                                    return (
                                      <Chip
                                        key={permission?.id}
                                        label={permission?.name}
                                        icon={
                                          <Tooltip
                                            arrow
                                            placement="bottom"
                                            title={
                                              permission?.description || ""
                                            }
                                          >
                                            <Checkbox
                                              color="primary"
                                              checked={permissionIds?.includes(
                                                permission?.id
                                              )}
                                              onChange={(e) => {
                                                setPermissionIds(
                                                  (state: any) => [
                                                    ...state.filter(
                                                      (permissionId: any) =>
                                                        !clientPermissionsIds?.includes(
                                                          permissionId
                                                        )
                                                    ),
                                                  ]
                                                );

                                                if (
                                                  permissionIds?.includes(
                                                    permission?.id
                                                  )
                                                ) {
                                                  setPermissionIds(
                                                    (state: any) => [
                                                      ...state.filter(
                                                        (permissionId: any) =>
                                                          permissionId !==
                                                          permission?.id
                                                      ),
                                                    ]
                                                  );
                                                } else {
                                                  setPermissionIds(
                                                    (state: any) => [
                                                      ...state,
                                                      permission?.id,
                                                    ]
                                                  );
                                                }
                                              }}
                                            />
                                          </Tooltip>
                                        }
                                        sx={{
                                          m: 1,
                                        }}
                                      />
                                    );
                                  } else {
                                    return <></>;
                                  }
                                }
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                )}

                {clientPermissions && (
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>Company Permissions</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <FormControlLabel
                        control={
                          <Tooltip
                            arrow
                            placement="bottom"
                            title={`Select All System permissions`}
                          >
                            <Checkbox
                              checked={entityPermissions.every((item: any) => {
                                return permissionIds.includes(item.id);
                              })}
                              onChange={() => {
                                let clientPermissionIds: string[] = [];
                                Object.keys(clientPermissions)?.map((item) => {
                                  clientPermissions[item].map((elt: any) => {
                                    clientPermissionIds.push(elt.id);
                                    return clientPermissionIds;
                                  });
                                  return clientPermissionIds;
                                });
                                if (
                                  clientPermissionIds.every((element) => {
                                    return permissionIds.includes(element);
                                  })
                                ) {
                                  setPermissionIds((state: any) => [
                                    ...state.filter(
                                      (el: any) =>
                                        !clientPermissionIds.includes(el)
                                    ),
                                  ]);
                                } else {
                                  const unselected = clientPermissionIds.filter(
                                    (e) => permissionIds.indexOf(e) < 0
                                  );
                                  setPermissionIds((state: any) => [
                                    ...state,
                                    ...unselected,
                                  ]);
                                }
                              }}
                            />
                          </Tooltip>
                        }
                        label="All Company Permissions"
                      />
                      {Object.keys(clientPermissions)?.map((category) => {
                        return (
                          <Box
                            key={category}
                            sx={{
                              mx: 3,
                              mt: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: "bold",
                              }}
                            >
                              {category}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                              }}
                            >
                              {clientPermissions[category]?.map(
                                (permission: any) => {
                                  if (permission) {
                                    return (
                                      <Chip
                                        key={permission?.id}
                                        label={permission?.name}
                                        icon={
                                          <Tooltip
                                            arrow
                                            placement="bottom"
                                            title={
                                              permission?.description || ""
                                            }
                                          >
                                            <Checkbox
                                              color="primary"
                                              checked={permissionIds?.includes(
                                                permission?.id
                                              )}
                                              onChange={(e) => {
                                                setPermissionIds(
                                                  (state: any) => [
                                                    ...state.filter(
                                                      (permissionId: any) =>
                                                        !systemPermissionsIds?.includes(
                                                          permissionId
                                                        )
                                                    ),
                                                  ]
                                                );
                                                if (
                                                  permissionIds?.includes(
                                                    permission?.id
                                                  )
                                                ) {
                                                  setPermissionIds(
                                                    (state: any) => [
                                                      ...state.filter(
                                                        (permissionId: any) =>
                                                          permissionId !==
                                                          permission?.id
                                                      ),
                                                    ]
                                                  );
                                                } else {
                                                  setPermissionIds(
                                                    (state: any) => [
                                                      ...state,
                                                      permission?.id,
                                                    ]
                                                  );
                                                }
                                              }}
                                            />
                                          </Tooltip>
                                        }
                                        sx={{
                                          m: 1,
                                        }}
                                      />
                                    );
                                  } else {
                                    return <></>;
                                  }
                                }
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            position: "fixed",
            bottom: 0,
            width: { xs: "100vw", md: 800 },
            height: 70,
            pr: 10,
            py: 2,
            bgcolor: "#F5F5F5",
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ px: 5, py: 1 }}
          >
            {transition.state === "submitting" && transitionData.name ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  m: 1,
                }}
              >
                <CircularProgress size={24} color="secondary" sx={{ mr: 2 }} />
                <Typography color="white">Saving...</Typography>
              </Box>
            ) : (
              <Typography color="white">Add Role</Typography>
            )}
          </Button>
        </Box>
      </Box>
    </Form>
  );
}
