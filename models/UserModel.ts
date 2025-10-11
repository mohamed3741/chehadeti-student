import {MediaModel} from './MediaModel';
import {SystemUserModel} from "./SystemUserModel";


export class UserModel {
    createdAt?: string;
    updatedAt?: string;
    id?: number;
    type?: string;
    email?: string;
    username?: string;
    tel?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
}
