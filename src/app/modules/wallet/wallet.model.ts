import { Schema, model } from 'mongoose';
import { IWallet, WalletStatus } from './wallet.interface';
import { envVars } from '../../config/env';

const walletSchema = new Schema<IWallet>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            unique: true,
        },
        balance: {
            type: Number,
            required: true,
            default: Number(envVars.INITIAL_ACCOUNT_BALANCE),
            min: 0,
        },
        status: {
            type: String,
            enum: Object.values(WalletStatus),
            default: WalletStatus.ACTIVE,
        },
    },
    {
        timestamps: true,
    }
);

export const Wallet = model<IWallet>('Wallet', walletSchema);
