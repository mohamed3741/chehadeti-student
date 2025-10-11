import apiClient from "./ApiClient";
import {Endpoints} from "./Endpoints";


const endPoint = `${Endpoints.CHEHADETI}/`;

const checkUserExist = (userName: String, roleName: String) => {
    return  apiClient.get(`${endPoint}check-exist/${userName}?roleName=${roleName}`)
}
const checkEmailExist = (email: string) => {
    return  apiClient.get(`${endPoint}check-exist/email/${email}`)
}

const generateCode = () => {
    return  apiClient.get(`${endPoint}supplier/restaurant-manager/generate-code`)
}

const checkCode = (body) => {
    return  apiClient.post(`${endPoint}supplier/restaurant-manager/check-code`, body)
}
const checkCodeForReset = (body) => {
    return  apiClient.post(`${endPoint}check-code-for-reset`, body)
}
const resetPassword = (passwd,body) => {
    return  apiClient.post(`${endPoint}reset-password?newPassword=${passwd}`, body)
}

const getMe = () => {
    return  apiClient.get(`${endPoint}students/me`)
}

const refreshToken = (body) => {
    return  apiClient.post(`${endPoint}users/refresh-token`,body)
}

const changePassword = (body) => {
    return  apiClient.post(`${endPoint}users/change-password`,body)
}

const resetPasswd = (tel) => {
    return apiClient.post(`${endPoint}request-password-reset`, tel, {
        headers: {
            'Content-Type': 'text/plain'
        }
    });
}
const setTel = (tel: string) => {
    return  apiClient.get(`${endPoint}supplier/restaurant-manager/set-phone-number/${tel}`)
}

const updateLogo = (logo) => {
    return  apiClient.patch(`${endPoint}logo/`, logo)
}

const updateProfile = (body) => {
    return  apiClient.put(`${endPoint}driver/update-profile`, body)
}

const deleteProfile = (body) => {
    return  apiClient.post(`${endPoint}driver/delete-profile`, body)
}

const updateUsername = (body) => {
    return  apiClient.put(`${endPoint}driver/update-username`, body)
}

const verifyPassword = (body) => {
    return  apiClient.post(`${endPoint}driver/verify-password`, body)
}


const deleteUser = (id) => {
    return  apiClient.delete(`${endPoint}delete/${id}`)
}
export const UserApi = {
    checkUserExist,
    updateLogo,
    getMe,
    generateCode,
    checkCode,
    recoverPwd: resetPasswd,
    deleteUser,
    checkEmailExist,
    refreshToken,
    setTel,
    checkCodeForReset,
    resetPassword,
    changePassword,
    updateProfile,
    deleteProfile,
    updateUsername,
    verifyPassword
}
