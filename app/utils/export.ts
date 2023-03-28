import { ExportToCsv } from "export-to-csv";

const flattenObject = (input: any) => {
    let result: any = {};
    for (const key in input) {
        if (!input.hasOwnProperty(key)) {
            continue;
        }
        if (typeof input[key] === "object" && !Array.isArray(input[key])) {
            var subFlatObject = flattenObject(input[key]);
            for (const subkey in subFlatObject) {
                result[key + "_" + subkey] = subFlatObject[subkey];
            }
        } else {
            result[key] = input[key];
        }
    }
    return result;
};

export const handleExportData = (exportData: any, title: string, filename: string) => {
    const csvOptions = {
        fieldSeparator: ",",
        quoteStrings: '"',
        decimalSeparator: ".",
        showLabels: true,
        useBom: true,
        useKeysAsHeaders: true,
        showTitle: true,
        title,
        filename
    };
    const csvExporter = new ExportToCsv(csvOptions);

    let flattenData = exportData
    if (exportData.length !== 0) {
        flattenData = exportData.map((data: any) => {
            const flattenObj = flattenObject(data);
            Object.keys(flattenObj).forEach(function (ele: any) {
                const key = ele;
                if (ele.includes("_")) {
                    flattenObj[
                        ele
                            .split("_")
                            .map(
                                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")
                    ] = flattenObj[key];
                } else if (ele && ele.match(/[A-Z]/g)?.length > 0) {
                    // console.log({ ele })
                    flattenObj[
                        ele.slice(0, ele.indexOf(ele.match(/[A-Z]/g)[0])).charAt(0).toUpperCase() +
                        ele.slice(1, ele.indexOf(ele.match(/[A-Z]/g)[0])) +
                        " " +
                        ele.slice(ele.indexOf(ele.match(/[A-Z]/g)[0]))
                    ] = flattenObj[key];
                } else if (ele && ele.match(/[A-Z]/g)?.length > 1) {
                    console.log({ ele })
                    flattenObj[
                        ele.slice(0, ele.indexOf(ele.match(/[A-Z]/g)[1])) +
                        " " +
                        ele.slice(ele.indexOf(ele.match(/[A-Z]/g)[1]))
                    ] = flattenObj[key];
                }
                else {
                    flattenObj[ele.charAt(0).toUpperCase() + ele.slice(1)] =
                        flattenObj[key];
                }
                delete flattenObj[key];
            });
            return flattenObj;
        });
        console.log({ flattenData });
        csvExporter.generateCsv(flattenData);
    }
};