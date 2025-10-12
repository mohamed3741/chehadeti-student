import {GenderEnum, RolesEnum} from "./Static";
import { ImageSourcePropType } from "react-native";

export class SystemUserModel {
    createdAt?: string;
    updatedAt?: string;
    
    id?: number;
    validationStatus?: string; // PENDING, VALIDATED, REJECTED, etc.
    validatedAt?: string;
    
    type?: string; // STUDENT, ADMIN, etc.
    email?: string;
    username?: string;
    tel?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    
    name?: string;
    isTelVerified: boolean;
    classe: any;
    classe: any;

}
