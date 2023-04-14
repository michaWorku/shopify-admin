import canUser, { AbilityType } from './ability'

export async function canDeleteUser(
    editorId: string,
    editedId: string,
    client?: {}
) {
    let edit: any
    let flag = false
    edit = await canUser(editorId, 'manage', 'all', {})
    if (edit?.ok) {
        flag = true
    } else {
        if (!client) {
            edit = await canUser(editorId, 'delete', 'SystemUser', {})
            if (edit?.status === 200) {
                edit = await canUser(editedId, 'delete', 'SystemUser', {})
                if (!edit.ok) {
                    flag = true
                }
            }
        } else {
            /*eslint-disable*/
            edit = await canUser(editorId, 'delete', 'SystemUser', {
                clientId: client,
            })
            if (edit?.status === 200) {
                edit = await canUser(editedId, 'delete', 'SystemUser', {
                    clientId: client,
                })
                if (!edit.ok) {
                    flag = true
                }
            }
        }
    }

    return flag
}
