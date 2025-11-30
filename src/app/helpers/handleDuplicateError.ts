import { TGenericErrorResponse } from "../interfaces/error.types";



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleDuplicateError = (err: any): TGenericErrorResponse => {

    const fieldMatch = err?.message.match(/fields: \(([^)]+)\)/);
    const duplicateField = fieldMatch ? fieldMatch[1] : "Value";
    return {
        statusCode: 400,
        message: `${duplicateField} is Already Exist!`
    }
}