import canUser from "./ability";

export async function canEditUser(
  editorId: string,
  editedId: string,
  client?: any
) {
  let edit: any;
  let flag = false;
  edit = await canUser(editorId, "manage", "all", {});
  if (edit?.ok) {
    flag = true;
  } else {
    if (!client) {
      edit = await canUser(editorId, "update", "SystemUser", {});
      if (edit.status === 200) {
        edit = await canUser(editedId, "update", "SystemUser", {});
        if (edit?.status != 200) {
          flag = true;
        }
      }
    } else {
      /*eslint-disable*/
      edit = await canUser(editorId, "update", "SystemUser", {
        clientId: client,
      });
      if (edit.status === 200) {
        edit = await canUser(editedId, "update", "SystemUser", {
          clientId: client,
        });
        if (edit?.status != 200) {
          flag = true;
        }
      }
    }
  }

  return flag;
}
