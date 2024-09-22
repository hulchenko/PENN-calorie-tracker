"use server";

import { sql } from '@/db/client';
import { v4 as uuidv4 } from 'uuid';
import { UserDB } from '@/types/User';
import { revalidatePath } from 'next/cache'; // purges cached data

export const createUser = async (user): Promise<UserDB[] | any> => {
    try {
        const {name, email, password} = user;
        const id = uuidv4();
        await sql `INSERT INTO users (user_id, name, email, password) VALUES (${id}, ${name}, ${email}, ${password})`;
        const userData = {
                user_id: id,
                name,
                email,
                password
            };
        revalidatePath('/');
        return userData;
    } catch (error) {
        throw new Error('Error creating a user in database', error);
    }
}