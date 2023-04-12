import canUser from './ability'

export async function canEditUser(
    editorId: string,
    editedId: string,
    client?: any
) {
    let edit: any
    let flag = false
    if (!client) {
        edit = await canUser(editorId, 'update', 'SystemUser', {})
        if (edit.status === 200) {
            edit = await canUser(editedId, 'update', 'SystemUser', {})
            if (!edit.ok) {
                flag = true
            }
        }
    } else {
        /*eslint-disable*/
        edit = await canUser(editorId, 'update', 'SystemUser', {
            clientId: client,
        })
        console.log({
            editedId,
            editorId,
            edit: JSON.stringify(await edit.json()),
        })
        if (edit.status === 200) {
            edit = await canUser(editedId, 'update', 'SystemUser', {
                clientId: client,
            })
            if (!edit.ok) {
                flag = true
            }
        }
    }

    return flag
}
