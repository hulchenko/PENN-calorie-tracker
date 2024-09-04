"use server";

import {sql} from '../lib/db';
import {v4 as uuidv4} from 'uuid';
import { UserDB } from '../types/User';

export const createUser = async (user): Promise<UserDB[] | any> => {
    try {
        const {firstName, lastName, email, password} = user;
        const id = uuidv4();
        console.log(`QUERY: INSERT INTO users (user_id, first_name, last_name, email, password) VALUES (${id}, ${firstName}, ${lastName}, ${email}, ${password})`)
        await sql `INSERT INTO users (user_id, first_name, last_name, email, password) VALUES (${id}, ${firstName}, ${lastName}, ${email}, ${password})`;
        const userData = {
                user_id: id,
                first_name: firstName,
                last_name: lastName,
                email,
                password
            };
        return userData;
    } catch (error) {
        console.error('Error creating a user');
        throw error
    }
}