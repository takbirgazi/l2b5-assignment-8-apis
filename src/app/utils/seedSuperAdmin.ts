/* eslint-disable no-console */
import { envVars } from '../config/env';
import bcryptjs from "bcryptjs";
import { User } from '../modules/user/user.model';
import { IAuthProvider, Role } from '../modules/user/user.interface';
import { Wallet } from '../modules/wallet/wallet.model';
import { WalletStatus } from '../modules/wallet/wallet.interface';

export const seedSuperAdmin = async () => {
    const session = await User.startSession();
    session.startTransaction();
    try {
        const { email, password, ...rest } = {
            name: "Super Admin",
            email: envVars.SUPER_ADMIN_EMAIL,
            // wallet: new Types.ObjectId(), // Removed to avoid duplicate 'wallet'
            password: envVars.SUPER_ADMIN_PASSWORD,
            role: Role.SUPER_ADMIN,
            isVerified: true
        };

        // Check if user already exists
        const isExistUser = await User.findOne({ email }).session(session);
        if (isExistUser) {
            console.log("Super Admin has already been created!");
            await session.abortTransaction();
            session.endSession();
            return;
        }

        // Create wallet for the user
        const wallet = await Wallet.create(
            [
                {
                    balance: Number(envVars.INITIAL_ACCOUNT_BALANCE),
                    status: WalletStatus.ACTIVE,
                },
            ],
            { session }
        );

        // Hash password
        const hashedPassword = await bcryptjs.hash(
            password as string,
            Number(envVars.BCRYPT_SALT_ROUND)
        );

        // Setup auth provider
        const authProvider: IAuthProvider = {
            provider: "credential",
            providerId: email as string,
        };

        // Create user
        const user = await User.create(
            [
                {
                    email,
                    password: hashedPassword,
                    auths: [authProvider],
                    wallet: wallet[0]._id,
                    ...rest,
                },
            ],
            { session }
        );

        // Link wallet to user
        await Wallet.findByIdAndUpdate(
            wallet[0]._id,
            { userId: user[0]._id },
            { new: true, runValidators: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        console.log("Super Admin created:", user[0]);
        return user[0];

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
}