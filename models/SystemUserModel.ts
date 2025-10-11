import {GenderEnum, RolesEnum} from "./Static";
import { ImageSourcePropType } from "react-native";

export class SystemUserModel {
    // From HasTimestampsDTO
    createdAt?: string;
    updatedAt?: string;
    
    // From StudentDTO
    id?: number;
    validationStatus?: string; // PENDING, VALIDATED, REJECTED, etc.
    validatedAt?: string;
    
    // From UserDTO
    type?: string; // STUDENT, ADMIN, etc.
    email?: string;
    username?: string;
    tel?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    
    // Legacy/Additional fields (kept for backward compatibility)
    name?: string;

}
