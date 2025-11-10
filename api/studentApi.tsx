import { Endpoints } from "./Endpoints";
import apiClient from "./ApiClient";
import { StudentAuthDTO, ClasseDTO } from "../models/UserModel";

const endPoint = `${Endpoints.CHEHADETI}/students`;
const classesEndPoint = `${Endpoints.CHEHADETI}/classes`;

const toIso = (d: Date | string) =>
    d instanceof Date ? d.toISOString() : d;

/**
 * Create a new student
 * POST /students
 */
const createStudent = (studentDTO: StudentAuthDTO) => {
    return apiClient.post<StudentAuthDTO>(`${endPoint}`, studentDTO);
};

/**
 * Get student by ID
 * GET /students/{id}
 */
const getStudentById = (id: number) => {
    return apiClient.get<StudentAuthDTO>(`${endPoint}/${id}`);
};

/**
 * Get all students
 * GET /students
 */
const getAllStudents = () => {
    return apiClient.get<StudentAuthDTO[]>(`${endPoint}`);
};

/**
 * Delete a student by ID
 * DELETE /students/{id}
 */
const deleteStudent = (id: number) => {
    return apiClient.delete(`${endPoint}/${id}`);
};

/**
 * Get student by username
 * GET /students/username/{username}
 */
const getStudentByUsername = (username: string) => {
    return apiClient.get<StudentAuthDTO>(`${endPoint}/username/${username}`);
};

/**
 * Get student by email
 * GET /students/email/{email}
 */
const getStudentByEmail = (email: string) => {
    return apiClient.get<StudentAuthDTO>(`${endPoint}/email/${email}`);
};

/**
 * Student signup
 * POST /students/signup
 */
const signup = (studentDTO: StudentAuthDTO) => {
    return apiClient.post<StudentAuthDTO>(`${endPoint}/signup`, studentDTO);
};

/**
 * Get current authenticated student
 * GET /students/me
 */
const findMe = () => {
    return apiClient.get<StudentAuthDTO>(`${endPoint}/me`);
};

/**
 * Get all classes
 * GET /classes/list
 */
const getClasses = () => {
    return apiClient.get<ClasseDTO[]>(`${classesEndPoint}/list`);
};

/**
 * Delete current authenticated student account
 * POST /students/delete-account
 */
const deleteAccount = (password: string) => {
    return apiClient.post(`${endPoint}/delete-account?password=${encodeURIComponent(password)}`);
};

export const StudentApi = {
    createStudent,
    getStudentById,
    getAllStudents,
    deleteStudent,
    getStudentByUsername,
    getStudentByEmail,
    signup,
    findMe,
    getClasses,
    deleteAccount
};
