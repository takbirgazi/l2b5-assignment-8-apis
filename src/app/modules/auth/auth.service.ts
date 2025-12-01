import prisma from "../../shared/prisma"

const login = async () => {

    const result = await prisma.user.findMany()

    return {
        message: result
    }
}

export const AuthService = {
    login,
}