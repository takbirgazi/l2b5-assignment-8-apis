import { newAccessTokenByRefreshToken } from "../../utils/userTokens";

// Generate New Access Token by refresh token
const getNewAccessToken = async (refreshToken: string) => {

    const newAccessToken = await newAccessTokenByRefreshToken(refreshToken);

    return {
        accessToken: newAccessToken,
    }
};

export const AuthService = {
    getNewAccessToken,
}