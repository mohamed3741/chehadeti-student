


export class UserModel {
    createdAt?: string;
    updatedAt?: string;

    // From StudentDTO
    id?: number;


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

// Class DTO
export interface ClasseDTO {
    id: number;
    code?: string;
    name: string;
    description?: string;
    sortId?: number;
    teacherId?: number;
}

// Student DTO for authentication (extends UserModel)
export interface StudentAuthDTO extends UserModel {
    validationStatus?: string;
    validatedAt?: string;
    classe?: ClasseDTO;
    isTelVerified?: boolean;
}

export interface AccessTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    'not-before-policy'?: number;
    session_state?: string;
    scope?: string;
}

// External token exchange DTO
export interface ExchangeableTokenDto {
    externalToken: string;
    loginProvider: string;
}

// Refresh token request DTO
export interface RefreshTokenDto {
    refresh_token: string;
}

// User verification code DTO
export interface UserCode {
    username: string;
    code: string;
}

// Phone verification response DTO
export interface TelVerificationResponseDto {
    exists: boolean;
    message?: string;
    tel?: string;
}

// Password change request DTO
export interface PasswordChangeRequest {
    oldPassword: string;
    newPassword: string;
}