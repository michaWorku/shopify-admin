export function formatFileSize(bytes: number) {
    if (bytes == 0) return '0 Bytes'
    let k = 100000,
        dm = 1,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export const format = "ddd, DD MMM YYYY HH:mm:ss";

/**
 * Separates a camel case string with capital letters and makes the first letter capitalized.
 * @param {string} camelCaseString - The camel case string to be separated and capitalized.
 * @returns {string} The separated and capitalized string.
 */
export const separateAndCapitalize = (camelCaseString: string) => {
    const separatedString = camelCaseString.replace(/([A-Z])/g, " $1");
    const capitalizedString = separatedString.charAt(0).toUpperCase() + separatedString.slice(1);
    return capitalizedString;
}