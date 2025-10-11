declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENVIRONMENT: 'development' | 'production' | 'staging' | 'integration',
            MEDRASTI_APP: string
            GG_ANDROID_CLIENT_ID: string
            GG_IOS_CLIENT_ID: string
        }
    }
}
export {};
