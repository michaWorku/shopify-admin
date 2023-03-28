export function formatFileSize(bytes: number) {
    if (bytes == 0) return '0 Bytes'
    let k = 100000,
        dm = 1,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const format = "ddd, DD MMM YYYY HH:mm:ss";
