import z from "zod";
import { WalletStatus } from "./wallet.interface";


export const updateWalletZodSchema = z.object({
    balance: z.number({ message: "Balance must be number" }).optional(),
    status: z.enum(Object.values(WalletStatus) as [string]).optional(),
})