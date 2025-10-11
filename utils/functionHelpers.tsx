import {AccountType} from "../models/Static";
import {Platform} from "react-native";
import * as FileSystem from 'expo-file-system';
import {SystemUserModel} from "../models/SystemUserModel";

const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export const makeId = (length = 30) => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const getExtension = (uri, isFromCam) => {
    if (isFromCam) {
        return uri.toString().substring(uri.toString().lastIndexOf(".") + 1, uri.length)?.toLowerCase();
    }
    return Platform.OS === 'ios' && uri.toString().lastIndexOf("ext=") != -1 ?
        uri.toString().substring(uri.toString().lastIndexOf("ext=") + 4, uri.length)?.toLowerCase()
        :
        uri.toString().substring(uri.toString().lastIndexOf(".") + 1, uri.length)?.toLowerCase();
};

export const createFileData = (photo, isFromCam = false) => {
    return {
        name: makeId() + '.' + getExtension(photo, isFromCam),
        type: 'image/' + getExtension(photo, isFromCam),
        uri: photo
    }
};

export const avatarTitle = (user: SystemUserModel | null) => {
    return avatarTitleByName(user?.name);
};

export const avatarTitleByName = (name: string | null) => {
    let tempTitle = '';
    if (name) {
        let nm = name.replace(/\s+/g, ' ').toUpperCase().trim().split(' ')
        if (nm.length === 1) {
            tempTitle = `${nm[0][0].toUpperCase()}`
        }
        if (nm.length >= 2) {
            tempTitle = `${nm[0][0].toUpperCase()}${nm[1][0].toUpperCase()}`
        }
    }
    return tempTitle;
};

export const isNum = (val: string): boolean => {
    return /^\d+$/.test(val);
}

export const isValidPhone = (tel: string, code: string): boolean => {
    if (!tel || !code) return false
    try {
        const phone = phoneUtil.parseAndKeepRawInput(tel, code);
        return phoneUtil.isValidNumber(phone);
    } catch (e) {
        return false
    }
}

export const trimTel = (tel: string, code: string): string => {
    if (!tel?.length || !code) return tel;
    const phone = phoneUtil.parseAndKeepRawInput(tel, code);
    return phone.getNationalNumber()?.toString();
}


const buildFormData = (formData, data, parentKey?) => {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)
        && !(data?.type?.startsWith('image/'))) {
        Object.keys(data).forEach(key => {
            let validKey = key;
            if (parentKey) {
                validKey = `${parentKey}.${key}`
            }
            if (parentKey && data[key]?.type?.startsWith('image/')) {
                validKey = parentKey
            }
            buildFormData(formData, data[key], validKey);
        });
    } else {
        const value = data == null ? null : data;
        if (value === null) return;
        formData.append(parentKey, value);
    }
}

export function jsonToFormData(data) {
    const formData = new FormData();

    buildFormData(formData, data);

    return formData;
}

export const convertToB64 = async (file, withPrefix = false) => {
    try {
        const fileUri = file.startsWith('file://') ? file.replace('file://', '') : file.uri;
        const base64String = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        return withPrefix
            ? `data:${file.type};base64,${base64String}`
            : base64String;
    } catch (error) {
        console.error('Error converting file to base64:', error);
        return null;
    }
};


export const getAccountLogo = (type: AccountType): string => {
    switch (type) {
        case AccountType.CASH:
            return "cash.png";
        case AccountType.BANKILY:
            return "bankily.png";
        case AccountType.MASRIVI:
            return "masrivi.png";
        case AccountType.SEDAD:
            return "sedad.png";
        case AccountType.BIM_BANK:
            return "bimbank.png";
        default:
            return "cash.png";
    }
};

export const getAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    if (month >= 10) {
        return `${year}/${year + 1}`;
    } else {
        return `${year - 1}/${year}`;
    }
};

export const formatAccountTypeName = (type: AccountType): string => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};
