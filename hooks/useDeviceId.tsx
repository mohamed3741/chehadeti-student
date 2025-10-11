import {useEffect, useState} from 'react'
import {getSecureData, storeSecureData} from "../utils/SecureStorage";
import {DataKey} from "../models/Static";
import {makeId} from "../utils/functionHelpers";

export function useDeviceId() {
    const [deviceId, setDeviceId] = useState<string>()

    useEffect(() => {
        (async () => await checkDeviceId())()
    }, []);

    const checkDeviceId = async () => {
        const devId = await getSecureData(DataKey.deviceId)
        if (devId) {
            setDeviceId(devId)
        } else {
            const id = makeId();
            setDeviceId(id);
            await storeSecureData(DataKey.deviceId, id);
        }
    }

    return {
        deviceId
    }
}
