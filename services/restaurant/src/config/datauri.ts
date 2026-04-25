import DataURiParser from "datauri/parser.js";
import path from "path";


const getBuffer = (file: any) => {
    const parser = new DataURiParser();

    const extensionName = path.extname(file.originalname).toString();

    return parser.format(extensionName, file.buffer);
}


export default getBuffer;