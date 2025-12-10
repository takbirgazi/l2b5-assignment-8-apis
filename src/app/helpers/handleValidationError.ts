import mongoose from "mongoose";
import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.types";

export const handelValidationError = (err: mongoose.Error.ValidationError): TGenericErrorResponse => {
    const errorSources: TErrorSources[] = []
    const errors = Object.values(err.errors);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors.forEach((errorObj: any) => errorSources.push({
        path: errorObj.path,
        message: errorObj.message
    }))

    return {
        statusCode: 400,
        message: `Validation Error!`,
        errorSources
    }
}