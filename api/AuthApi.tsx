import apiDriver from "./ApiClient";
import {Endpoints} from "./Endpoints";
import {UserModel} from "../models/UserModel";


const login = (user:UserModel) => {
    return  apiDriver.post(`${Endpoints.CHEHADETI}/users/login`, user)
}


const signUp = (user: {
    firstName: string;
    lastName: string;
    password: string;
    tel: string;
    email: string;
    username: string
}) => {
    return  apiDriver.post(`${Endpoints.CHEHADETI}/driver/signup`, user)
}

export const AuthApi = {
    login,
    signUp
}
