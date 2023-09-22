declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FEEFO_MERCHANT_IDENTIFIER: string
        }
    }
}

export {}