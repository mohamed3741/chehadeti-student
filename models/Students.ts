export interface MediaDTO {
    id: number
    type: "IMAGE" | "VIDEO" | "DOCUMENT"
    link: string
    keyName: string
    thumbnail?: string
    createdAt?: string
    updatedAt?: string
}

export interface ParentDTO {
    id: number
    firstName: string
    lastName: string
    tel?: string
    whatsappNumber?: string
    profession?: string
    address?: string
    createdAt?: string
    updatedAt?: string
}

export interface StudentDTO {
    id: number
    matricule: string
    firstName: string
    lastName: string
    dateOfBirth: string
    nni?: string
    tel?: string
    whatsappNumber?: string
    genre: "MALE" | "FEMALE"
    address?: string
    identityCard?: MediaDTO
    photo?: MediaDTO
    father?: ParentDTO
    mother?: ParentDTO
    codeRim?: string
    createdAt?: string
    updatedAt?: string
}

export interface UnpaidStudentResponse {
    content: StudentDTO[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

export interface AbsentStudentResponse {
    content: StudentDTO[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}
