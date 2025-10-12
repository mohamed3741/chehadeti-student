// LMS Models

export enum MediaEnum {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    AUDIO = 'AUDIO',
}

export interface MediaDTO {
    id: number;
    type: MediaEnum;
    link: string;
    keyName: string;
    thumbnail?: string;
    mimeType?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TeacherDTO {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    tel?: string;
}

export interface CourseDTO {
    id: number;
    title: string;
    description?: string;
    sortId?: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: number;
    classeId?: number | null;
}

export interface ChapterDTO {
    id: number;
    title: string;
    description?: string;
    sortId?: number;
    courseId?: number;
}

export interface SubsectionDTO {
    id: number;
    chapterId?: number;
    title: string;
    description?: string;
    sortId?: number;
    createdBy?: number;
}

export interface ContentDTO {
    id: number;
    title: string;
    description?: string;
    contentType: string;
    media?: MediaDTO;
    isPublished?: boolean;
    publishAt?: string;
    unpublishAt?: string;
    sortId?: number;
    subsectionId?: number;
    teacherDTO?: TeacherDTO;
    createdAt?: string;
    updatedAt?: string;
}

// Response types for lists
export interface CoursesResponse {
    content: CourseDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ChaptersResponse {
    content: ChapterDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface SubsectionsResponse {
    content: SubsectionDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ContentsResponse {
    content: ContentDTO[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

