import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
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
import {
  Form,
  useActionData,
  useLoaderData,
  useSubmit,
  useTransition,
} from "@remix-run/react";
import { useEffect, useState } from "react";

export default function AddRoleForm({ handleCloseModal, loaderData, actionData }: any) {
  const submit = useSubmit();
  const transition = useTransition();

  let transitionData: any;
  transition?.submission?.formData
    ? (transitionData = Object.fromEntries(transition?.submission?.formData))
    : (transitionData = "");
  const [name, setName] = useState("");
  const [permissionIds, setPermissionIds] = useState([]) as any;
  const [entityPermission, setEntityPermission] = useState({}) as any;

  const permissions = actionData?.data?.permissions;

  // useEffect(() => {
  //   setEntityPermission((state: any) => {
  //     return { ...state, ...permissions };
  //   });
  // }, [actionData, permissions]);

  const departments = loaderData?.data?.entities?.departments?.data;
  const clients = loaderData?.data?.entities?.clients?.data;
  const associations = loaderData?.data?.entities?.associations?.data;
  const registrantCompanies = loaderData?.data?.entities?.registrantCompanies?.data;

  const removeEntity = (newValue: any, entity: string) => {
    if (
      Object.keys(entityPermission).length &&
      entityPermission[entity] &&
      Object.keys(entityPermission[entity]).length
    ) {
      let depName: any = [];
      newValue.map((item: any) => {
        depName.push(item.name);
        return depName;
      });
      const removed = Object.keys(entityPermissions[entity]).filter(
        (e) => depName.indexOf(e) < 0
      );

      if (removed.length) {
        removed.map((item: any) => {
          Object.keys(entityPermission[entity][item]).map((cat) => {
            entityPermission[entity][item][cat].map((elt: any) => {
              if (permissionIds?.includes(elt?.id)) {
                setPermissionIds((state: any) => [
                  ...state.filter(
                    (permissionId: any) => permissionId !== elt?.id
                  ),
                ]);
              }
              return null;
            });
            return null;
          });
          return null;
        });
        return removed;
      }
      return null;
    }
    return null;
  };

  function handleEntityChange(
    event: any,
    newValue: any,
    type: any,
    entityKey: any
  ) {
    removeEntity(newValue, type);
    submit(
      { type, entityKey, entities: JSON.stringify(newValue) } as any,
      { method: "post" }
    );
  }

  function handleSubmit() {
    submit(
      { name, permissions: JSON.stringify(permissionIds) },
      { method: "post" }
    );
  }

  const categorizePermissions = (rawPermissions: []) => {
    const permissions = rawPermissions.reduce(function (
      permissions: any,
      permission: any
    ) {
      if (permission.category in permissions) {
        permissions[permission.category]?.push(permission);
      } else {
        permissions[permission.category] = [permission];
      }
      return permissions;
    },
    {});
    return permissions;
  };

  const systemPermission = loaderData?.data?.systemPermissions;
  let systemPermissions: any;
  if (systemPermission) {
    systemPermissions = categorizePermissions(systemPermission);
  }

  let entityPermissions: any = entityPermission;
  if (Object.keys(entityPermissions)?.length) {
    Object.keys(entityPermissions).map((item: any) => {
      if (Object.keys(entityPermissions[item])?.length) {
        Object.keys(entityPermissions[item])?.map((elt: any) => {
          if (entityPermissions[item][elt]?.data?.length) {
            entityPermissions[item][elt] = categorizePermissions(
              entityPermissions[item][elt]?.data
            );
          }
          return entityPermissions;
        });
      }
      return entityPermissions;
    });
  }

  return (
    <Form>
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
            <Typography variant="body1">
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
          <Grid xs={12} sm={5} md={4} sx={{ p: 1, mt: 2 }}>
            <Box
              sx={{
                bgcolor: "#FAFAFA",
                borderRadius: 1,
                py: 2,
                ml: 2,
              }}
            >
              <Typography sx={{ px: 1, fontWeight: "bold", mb: 3 }}>
                Entity Permissions
              </Typography>
              {departments && departments.length ? (
                <Box>
                  <Typography sx={{ pl: 1 }}>Select Departments</Typography>
                  <Autocomplete
                    multiple
                    filterSelectedOptions={true}
                    options={departments}
                    getOptionLabel={(option: any) => option.name}
                    onChange={(event, value) => {
                      handleEntityChange(
                        event,
                        value,
                        "Department",
                        "departmentId"
                      );
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Departments"
                        placeholder="Departments"
                        size="small"
                        sx={{
                          minWidth: 280,
                        }}
                      />
                    )}
                    sx={{
                      m: 1,
                    }}
                  />
                </Box>
              ) : (
                ""
              )}
              {/* { clients?.length===0 ?  */}
              (
                <Box>
                  <Typography sx={{ pl: 1 }}>Select Clients</Typography>
                  <Autocomplete
                    multiple
                    filterSelectedOptions={true}
                    options={[]}
                    getOptionLabel={(option: any) => option.name}
                    onChange={(event, value) => {
                      handleEntityChange(event, value, "Client", "clientId");
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Clients"
                        placeholder="Clients"
                        size="small"
                        sx={{
                          minWidth: 280,
                        }}
                      />
                    )}
                    sx={{
                      m: 1,
                    }}
                  />
                </Box>
              ) 
              {/* // : (
              //   ""
              // )} */}
              {/* // {associations && associations.length ? (
              //   <Box>
              //     <Typography sx={{ pl: 1 }}>Select Associations</Typography>
              //     <Autocomplete
              //       multiple
              //       filterSelectedOptions={true}
              //       options={associations}
              //       getOptionLabel={(option: any) => option.name}
              //       onChange={(event, value) => {
              //         handleEntityChange(
              //           event,
              //           value,
              //           "Association",
              //           "associationId"
              //         );
              //       }}
              //       size="small"
              //       renderInput={(params) => (
              //         <TextField
              //           {...params}
              //           label="Associations"
              //           placeholder="Associations"
              //           size="small"
              //           sx={{
              //             minWidth: 280,
              //           }}
              //         />
              //       )}
              //       sx={{
              //         m: 1,
              //       }}
              //     />
              //   </Box>
              // ) : (
              //   ""
              // )}
              // {registrantCompanies && registrantCompanies.length ? (
              //   <Box>
              //     <Typography sx={{ pl: 1 }}>
              //       Select Registrant Companies
              //     </Typography>
              //     <Autocomplete
              //       multiple
              //       filterSelectedOptions={true}
              //       options={registrantCompanies}
              //       getOptionLabel={(option: any) => option.name}
              //       onChange={(event, value) => {
              //         handleEntityChange(
              //           event,
              //           value,
              //           "Registrant Company",
              //           "registrantCompanyId"
              //         );
              //       }}
              //       size="small"
              //       renderInput={(params) => (
              //         <TextField
              //           {...params}
              //           label="Registrant Companies"
              //           placeholder="Registrant Companies"
              //           size="small"
              //           sx={{
              //             minWidth: 280,
              //           }}
              //         />
              //       )}
              //       sx={{
              //         m: 1,
              //       }}
              //     />
              //   </Box>
              // ) : (
              //   ""
              // )} */}
            </Box>
          </Grid>
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
                actionData?.error?.fieldError[0].fieldErrors?.name
                  ? actionData?.error?.fieldError[0].fieldErrors?.name[0]
                  : undefined
              }
              error={
                actionData?.error?.fieldError &&
                actionData?.error?.fieldError[0].fieldErrors.name
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
              {/* <Typography>System</Typography> */}
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
                                          title={permission?.description || ""}
                                        >
                                          <Checkbox
                                            color="primary"
                                            checked={permissionIds?.includes(
                                              permission?.id
                                            )}
                                            onChange={(e) => {
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
              {Object.keys(entityPermissions)?.length ? (
                Object.keys(entityPermissions)?.map((item) => {
                  return (
                    <Box key={item} sx={{ my: 2 }}>
                      {Object.keys(entityPermissions[item])?.length ? (
                        <Box>
                          {Object.keys(entityPermissions[item]).map((elt) => {
                            if (
                              Object.keys(entityPermissions[item][elt])?.length
                            ) {
                              let entityPermissionId: string[] = [];
                              Object.keys(entityPermissions[item][elt])?.map(
                                (cat) => {
                                  entityPermissions[item][elt][cat].map(
                                    (elt: any) => {
                                      entityPermissionId.push(elt.id);
                                      return entityPermissionId;
                                    }
                                  );
                                  return entityPermissionId;
                                }
                              );
                              return (
                                <Accordion
                                  key={elt}
                                  sx={{
                                    my: 1,
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                  >
                                    <Typography>{elt} Permissions</Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    <FormControlLabel
                                      control={
                                        <Tooltip
                                          arrow
                                          placement="bottom"
                                          title={`Select All ${elt} permissions`}
                                        >
                                          <Checkbox
                                            checked={entityPermissionId.every(
                                              (item: any) => {
                                                return permissionIds.includes(
                                                  item
                                                );
                                              }
                                            )}
                                            onChange={() => {
                                              let entityPermissionIds: string[] =
                                                [];
                                              Object.keys(
                                                entityPermissions[item][elt]
                                              )?.map((cat) => {
                                                entityPermissions[item][elt][
                                                  cat
                                                ].map((elt: any) => {
                                                  entityPermissionIds.push(
                                                    elt.id
                                                  );
                                                  return entityPermissionIds;
                                                });
                                                return entityPermissionIds;
                                              });
                                              if (
                                                entityPermissionIds.every(
                                                  (element) => {
                                                    return permissionIds.includes(
                                                      element
                                                    );
                                                  }
                                                )
                                              ) {
                                                setPermissionIds(
                                                  (state: any) => [
                                                    ...state.filter(
                                                      (el: any) =>
                                                        !entityPermissionIds.includes(
                                                          el
                                                        )
                                                    ),
                                                  ]
                                                );
                                              } else {
                                                const unselected =
                                                  entityPermissionIds.filter(
                                                    (e) =>
                                                      permissionIds.indexOf(e) <
                                                      0
                                                  );
                                                setPermissionIds(
                                                  (state: any) => [
                                                    ...state,
                                                    ...unselected,
                                                  ]
                                                );
                                              }
                                            }}
                                          />
                                        </Tooltip>
                                      }
                                      label={`All ${elt} permissions`}
                                    />
                                    {Object.keys(
                                      entityPermissions[item][elt]
                                    ).map((category: string) => {
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
                                            {entityPermissions[item][elt][
                                              category
                                            ].map((permission: any) => {
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
                                                          permission?.description ||
                                                          ""
                                                        }
                                                      >
                                                        <Checkbox
                                                          color="primary"
                                                          checked={permissionIds?.includes(
                                                            permission?.id
                                                          )}
                                                          onChange={(e) => {
                                                            if (
                                                              permissionIds?.includes(
                                                                permission?.id
                                                              )
                                                            ) {
                                                              setPermissionIds(
                                                                (
                                                                  state: any
                                                                ) => [
                                                                  ...state.filter(
                                                                    (
                                                                      permissionId: any
                                                                    ) =>
                                                                      permissionId !==
                                                                      permission?.id
                                                                  ),
                                                                ]
                                                              );
                                                            } else {
                                                              setPermissionIds(
                                                                (
                                                                  state: any
                                                                ) => [
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
                                            })}
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </AccordionDetails>
                                </Accordion>
                              );
                            } else {
                              return <></>;
                            }
                          })}
                          {transition.state === "submitting" &&
                          transitionData.type &&
                          transitionData.type === item ? (
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                m: 3,
                              }}
                            >
                              <CircularProgress size={24} />
                            </Box>
                          ) : (
                            <></>
                          )}
                        </Box>
                      ) : (
                        ""
                      )}
                    </Box>
                  );
                })
              ) : transition.state === "submitting" && transitionData.type ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    m: 3,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <></>
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
    </Form>
  );
}
