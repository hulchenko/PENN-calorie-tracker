"use server";

import { sql } from '@/db/client';
import { v4 as uuidv4 } from 'uuid';
import { UserDB } from '@/types/User';
import { revalidatePath } from 'next/cache'; // purges cached data

export const createUser = async (user): Promise<UserDB[] | any> => {
    try {
        const {firstName, lastName, email, password} = user;
        const id = uuidv4();
        await sql `INSERT INTO users (user_id, first_name, last_name, email, password) VALUES (${id}, ${firstName}, ${lastName}, ${email}, ${password})`;
        const userData = {
                user_id: id,
                first_name: firstName,
                last_name: lastName,
                email,
                password
            };
        revalidatePath('/');
        return userData;
    } catch (error) {
        throw new Error('Error creating a user', error);
    }
}