import language from "@google-cloud/language"

const client = new language.LanguageServiceClient()

export const analyzeSentiment = (text) => {
    const document = {
        content: text,
        type: 'PLAIN_TEXT'
    }
    return client.analyzeSentiment({ document })
}

