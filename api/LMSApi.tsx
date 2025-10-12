import { Endpoints } from "./Endpoints";
import apiClient from "./ApiClient";
import {
    CourseDTO,
    ChapterDTO,
    SubsectionDTO,
    ContentDTO,
    CoursesResponse,
    ChaptersResponse,
    SubsectionsResponse,
    ContentsResponse
} from "../models/LMS";

const coursesEndpoint = `${Endpoints.CHEHADETI}/courses`;
const chaptersEndpoint = `${Endpoints.CHEHADETI}/chapters`;
const subsectionsEndpoint = `${Endpoints.CHEHADETI}/subsections`;
const contentsEndpoint = `${Endpoints.CHEHADETI}/contents`;

const getCoursesByClasse = (classId: number) => {
    return apiClient.get<CourseDTO[]>(`${coursesEndpoint}/by-class/${classId}`);
};

/**
 * Get all courses
 * GET /courses/list
 */
const getAllCourses = () => {
    return apiClient.get<CourseDTO[]>(`${coursesEndpoint}/list`);
};

/**
 * Get course by ID
 * GET /courses/find/{id}
 */
const getCourseById = (id: number) => {
    return apiClient.get<CourseDTO>(`${coursesEndpoint}/find/${id}`);
};

/**
 * Get chapters by course ID
 * GET /chapters/by-course/{courseId}
 */
const getChaptersByCourse = (courseId: number) => {
    return apiClient.get<ChapterDTO[]>(`${chaptersEndpoint}/by-course/${courseId}`);
};

/**
 * Get chapters by class ID
 * GET /chapters/by-class/{classId}
 */
const getChaptersByClass = (classId: number) => {
    return apiClient.get<ChapterDTO[]>(`${chaptersEndpoint}/by-class/${classId}`);
};

/**
 * Get all chapters
 * GET /chapters/list
 */
const getAllChapters = () => {
    return apiClient.get<ChapterDTO[]>(`${chaptersEndpoint}/list`);
};

/**
 * Get chapter by ID
 * GET /chapters/find/{id}
 */
const getChapterById = (id: number) => {
    return apiClient.get<ChapterDTO>(`${chaptersEndpoint}/find/${id}`);
};

/**
 * Get subsections by chapter ID
 * GET /subsections/by-chapter/{chapterId}
 */
const getSubsectionsByChapter = (chapterId: number) => {
    return apiClient.get<SubsectionDTO[]>(`${subsectionsEndpoint}/by-chapter/${chapterId}`);
};

/**
 * Get subsections by course ID
 * GET /subsections/by-course/{courseId}
 */
const getSubsectionsByCourse = (courseId: number) => {
    return apiClient.get<SubsectionDTO[]>(`${subsectionsEndpoint}/by-course/${courseId}`);
};

/**
 * Get all subsections
 * GET /subsections/list
 */
const getAllSubsections = () => {
    return apiClient.get<SubsectionDTO[]>(`${subsectionsEndpoint}/list`);
};

/**
 * Get subsection by ID
 * GET /subsections/find/{id}
 */
const getSubsectionById = (id: number) => {
    return apiClient.get<SubsectionDTO>(`${subsectionsEndpoint}/find/${id}`);
};

/**
 * Get contents by subsection ID
 * GET /contents/by-subsection/{subsectionId}
 */
const getContentsBySubsection = (subsectionId: number) => {
    return apiClient.get<ContentDTO[]>(`${contentsEndpoint}/by-subsection/${subsectionId}`);
};

/**
 * Get contents by chapter ID
 * GET /contents/by-chapter/{chapterId}
 */
const getContentsByChapter = (chapterId: number) => {
    return apiClient.get<ContentDTO[]>(`${contentsEndpoint}/by-chapter/${chapterId}`);
};

/**
 * Get contents by course ID
 * GET /contents/by-course/{courseId}
 */
const getContentsByCourse = (courseId: number) => {
    return apiClient.get<ContentDTO[]>(`${contentsEndpoint}/by-course/${courseId}`);
};

/**
 * Get published contents
 * GET /contents/published
 */
const getPublishedContents = () => {
    return apiClient.get<ContentDTO[]>(`${contentsEndpoint}/published`);
};

/**
 * Get all contents (ADMIN/TEACHER only)
 * GET /contents/list
 */
const getAllContents = () => {
    return apiClient.get<ContentDTO[]>(`${contentsEndpoint}/list`);
};

/**
 * Get content by ID
 * GET /contents/find/{id}
 */
const getContentById = (id: number) => {
    return apiClient.get<ContentDTO>(`${contentsEndpoint}/find/${id}`);
};

export const LMSApi = {
    // Courses
    getCoursesByClasse,
    getAllCourses,
    getCourseById,
    
    // Chapters
    getChaptersByCourse,
    getChaptersByClass,
    getAllChapters,
    getChapterById,
    
    // Subsections
    getSubsectionsByChapter,
    getSubsectionsByCourse,
    getAllSubsections,
    getSubsectionById,
    
    // Contents
    getContentsBySubsection,
    getContentsByChapter,
    getContentsByCourse,
    getPublishedContents,
    getAllContents,
    getContentById,
};

