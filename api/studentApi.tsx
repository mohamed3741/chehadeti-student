import { Endpoints } from "./Endpoints";
import apiClient from "./ApiClient";

const endPoint = `${Endpoints.CHEHADETI}/students/`;

const toIso = (d: Date | string) =>
    d instanceof Date ? d.toISOString() : d;


const getStudents = () => {
    return apiClient.get(`${endPoint}all`);
};



export const StudentApi = {
    getStudents
};
