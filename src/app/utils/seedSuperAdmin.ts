/* eslint-disable no-console */

import * as bcrypt from 'bcryptjs';
import prisma from "../shared/prisma";
import { Role } from '@prisma/client';
import { envVars } from '../config/env';

const seedSuperAdmin = async () => {
    try {
        console.log("Attempting to connect to database...");

        // Test connection first
        await prisma.$connect();
        console.log("✅ Database connected!");

        if (!prisma) {
            console.error("Prisma client is not initialized");
            return;
        }

        console.log("Checking for existing super admin...");
        const isExistSuperAdmin = await prisma.user.findFirst({
            where: {
                role: Role.SUPER_ADMIN
            }
        });

        if (isExistSuperAdmin) {
            console.log("Super admin already exists!");
            return;
        }

        const hashedPassword = await bcrypt.hash(envVars.SUPER_ADMIN_PASSWORD, Number(envVars.BCRYPT_SALT_ROUND))

        const superAdminData = await prisma.user.create({
            data: {
                email: envVars.SUPER_ADMIN_EMAIL,
                password: hashedPassword,
                role: Role.SUPER_ADMIN,
                admin: {
                    create: {
                        name: "Admin",
                        //email: "super@admin.com",
                        contactNumber: "01811947182"
                    }
                }
            }
        });

        console.log("Super Admin Created Successfully!", superAdminData);
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await prisma.$disconnect();
    }
};

export default seedSuperAdmin;