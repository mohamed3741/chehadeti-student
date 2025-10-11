import apiDriver from "./ApiClient";
import {Endpoints} from "./Endpoints";
import {
    UserModel,
    AccessTokenResponse,
    ExchangeableTokenDto,
    RefreshTokenDto,
    UserCode,
    TelVerificationResponseDto,
    PasswordChangeRequest
} from "../models/UserModel";

const endPoint = `${Endpoints.CHEHADETI}/users`;

/**
 * Login with username and password
 * POST /users/login
 */
const login = (user: UserModel) => {
    return apiDriver.post<AccessTokenResponse>(`${endPoint}/login`, user);
};

/**
 * Exchange external token (e.g., Google, Facebook) for application token
 * POST /users/exchange-token
 */
const exchangeToken = (exchangeableToken: ExchangeableTokenDto) => {
    return apiDriver.post<AccessTokenResponse>(`${endPoint}/exchange-token`, exchangeableToken);
};

/**
 * Refresh access token using refresh token
 * POST /users/refresh-token
 */
const refreshToken = (refreshTokenDto: RefreshTokenDto) => {
    return apiDriver.post<AccessTokenResponse>(`${endPoint}/refresh-token`, refreshTokenDto);
};

/**
 * Register/update user's phone number
 * GET /users/set-phone-number/{tel}
 */
const registerPhoneNumber = (tel: string) => {
    return apiDriver.get<UserModel>(`${endPoint}/set-phone-number/${tel}`);
};

/**
 * Generate verification code for authenticated user
 * GET /users/generate-code
 */
const generateCode = () => {
    return apiDriver.get<any>(`${endPoint}/generate-code`);
};

/**
 * Check/verify the code sent to user
 * POST /users/check-code
 */
const checkCode = (userCode: UserCode) => {
    return apiDriver.post<boolean>(`${endPoint}/check-code`, userCode);
};

/**
 * Check if phone number exists in the system
 * GET /users/phone-verification/{tel}
 */
const checkPhoneNumberExistence = (tel: string) => {
    return apiDriver.get<TelVerificationResponseDto>(`${endPoint}/phone-verification/${tel}`);
};

/**
 * Change user password (requires authentication)
 * POST /users/change-password
 */
const changePassword = (passwordChangeRequest: PasswordChangeRequest) => {
    return apiDriver.post<string>(`${endPoint}/change-password`, passwordChangeRequest);
};

/**
 * Sign up a new user (driver)
 * POST /driver/signup
 */
const signUp = (user: {
    firstName: string;
    lastName: string;
    password: string;
    tel: string;
    email: string;
    username: string;
}) => {
    return apiDriver.post(`${Endpoints.CHEHADETI}/driver/signup`, user);
};

export const AuthApi = {
    login,
    exchangeToken,
    refreshToken,
    registerPhoneNumber,
    generateCode,
    checkCode,
    checkPhoneNumberExistence,
    changePassword,
    signUp
};
