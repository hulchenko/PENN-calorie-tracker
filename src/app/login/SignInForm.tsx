"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@chakra-ui/react';

const SignInForm = () => {
    const toast = useToast();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFormValid, setIsFormValid] = useState({
        email: true,
        password: true
    });

    const submitHandler = async(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!email){
            setIsFormValid((prevState) => ({...prevState, email: false}));
        }

        if (!password){
            setIsFormValid((prevState) => ({...prevState, password: false}));
        }

        const validParams = email && password;

        if (validParams){
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                })
                
                if (response.ok){
                    router.push('/dashboard');
                    // TODO introduce loader here
                    toast({title: 'Signed in', status: 'info'});
                } else {
                    const { error } = await response.json();
                    toast({title: `${error}`, status: 'error'});
                }

            } catch (error) {
                console.error('Error occured during login:', error);
            }
        }
    }


    return (
        <>
            <form onSubmit={submitHandler} className='bg-white shadow-md rounded px-8 py-8 mb-4 max-w-md flex flex-col'>
                <div className='mb-6'>
                    <input onChange={e => setEmail(e.target.value)} className='shadow border rounded w-full py-3 px-3 text-gray-700  focus:outline-teal-700' type="email" name='email' placeholder='Email' />
                    {!email && !isFormValid.email && (
                        <span className='text-red-500 mt-1 text-sm block'>Email cannot be empty</span> 
                    )}
                </div>
                <div className='mb-6'>
                    <input onChange={e => setPassword(e.target.value)} className='shadow border rounded w-full py-3 px-3 text-gray-700  focus:outline-teal-700' type="password" name='password' placeholder='Password' />
                    {!password && !isFormValid.password && (
                        <span className='text-red-500 mt-1 text-sm block'>Password cannot be empty</span> 
                    )}
                </div>
                <button className='bg-teal-700 hover:bg-teal-600  text-white py-2 px-4 rounded' type='submit'>Sign In</button>
            </form>
        </>
     );
}
 
export default SignInForm;