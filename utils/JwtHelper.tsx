import jwt_decode from "jwt-decode";
import jwtDecode from "jwt-decode";
import {DataKey} from "../models/Static";
import {getSecureData} from "./SecureStorage";

export const decodeJwt = async () => {
    const token = await getSecureData(DataKey.token);
    const refreshToken = await getSecureData(DataKey.refreshToken);
    const accessTokenExpiry = await getSecureData(DataKey.accessTokenExpiry);
    const refreshTokenExpiry = await getSecureData(DataKey.refreshTokenExpiry);

    if (isJwtExpired(token)) return null

    const decodedJwt = jwt_decode(token);

    return {userName: decodedJwt.sub, token, refreshToken, accessTokenExpiry, refreshTokenExpiry};
};


const isJwtExpired = (token) => {
    if (typeof (token) !== 'string' || !token) {
        return true;
    }

    let isJwtExpired = false;
    const {exp} = jwtDecode(token);
    const currentTime = new Date().getTime() / 1000;

    if (currentTime > exp) isJwtExpired = true;

    return isJwtExpired;
}

export const getInitials = (s: any) => {
    const f = (s?.firstName || '').trim()
    const l = (s?.lastName || '').trim()
    const fi = f ? f[0] : ''
    const li = l ? l[0] : ''
    const initials = (fi + li).toUpperCase()
    return initials || '??'
}

export const fmtCurrency = (n: number, currency = 'MRU') => {
    if (Number.isNaN(n)) return '—'
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            maximumFractionDigits: 0,
        }).format(n)
    } catch {
        return `${n}`
    }
}

export const sumBy = (arr: any[], key: string) =>
    Array.isArray(arr) ? arr.reduce((s, x) => s + (Number(x?.[key]) || 0), 0) : 0

export const trimJoin = (a?: string | null, b?: string | null) => [a?.trim?.(), b?.trim?.()].filter(Boolean).join(' ')
