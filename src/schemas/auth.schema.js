import {z} from "zod" 

export const signupSchema = z.object({
    name: z.string("PLease enter valid string in name").min(2).max(30),
    email: z.email("Please enter a valid email"),
    password: z.string("Password must contain at least 8 characters").min(8)
})