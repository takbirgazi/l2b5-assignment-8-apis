import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from 'bcryptjs';
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Wallet } from "../modules/wallet/wallet.model";
import { WalletStatus } from "../modules/wallet/wallet.interface";



passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isExistUser = await User.findOne({ email });
            if (!isExistUser) {
                return done(null, false, { message: "User does not found" });
            }

            const isGoogleAuth = isExistUser?.auths.some(provObj => provObj.provider == "google");

            if (isGoogleAuth && !isExistUser.password) {
                return done(null, false, { message: "You are register with google before." })
            }

            const isPasswordMath = await bcryptjs.compare(password as string, isExistUser.password as string);

            if (!isPasswordMath) {
                return done(null, false, { message: "Password not match!" });
            }

            return done(null, isExistUser);
        } catch (error) {
            return done(error);
        }
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: `${envVars.BACKEND_URL}/api/v1/auth/google/callback`,
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            const session = await User.startSession();
            session.startTransaction();

            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(null, false, { message: "Email not found!" });
                }

                let user = await User.findOne({ email });

                if (!user) {
                    const [wallet] = await Wallet.create(
                        [
                            {
                                balance: Number(envVars.INITIAL_ACCOUNT_BALANCE),
                                status: WalletStatus.ACTIVE,
                            },
                        ],
                        { session }
                    );

                    const [newUser] = await User.create(
                        [
                            {
                                email,
                                wallet: wallet._id,
                                name: profile.displayName,
                                picture: profile.photos?.[0]?.value,
                                role: Role.USER,
                                isVerified: true,
                                auths: [
                                    {
                                        provider: "google",
                                        providerId: profile.id,
                                    },
                                ],
                            },
                        ],
                        { session }
                    );

                    await Wallet.findByIdAndUpdate(
                        wallet._id,
                        { userId: newUser._id },
                        { new: true, runValidators: true, session }
                    );

                    user = newUser;
                }

                await session.commitTransaction();
                session.endSession();

                return done(null, user);
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                return done(error);
            }
        }
    )
);


// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    done(null, user._id);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});