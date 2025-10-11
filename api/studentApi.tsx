import { Endpoints } from "./Endpoints";
import apiClient from "./ApiClient";

const endPoint = `${Endpoints.MEDRASTI_APP}/students/`;

const toIso = (d: Date | string) =>
    d instanceof Date ? d.toISOString() : d;


const getStudents = (page: number) => {
    return apiClient.get(`${endPoint}all`, {
        params: { page },
    });
};



export const StudentApi = {
    getStudents
};
