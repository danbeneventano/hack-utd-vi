import language from "@google-cloud/language"

const client = new language.LanguageServiceClient()

export const analyzeSentiment = (text) => {
    const document = {
        content: text,
        type: 'PLAIN_TEXT'
    }
    return client.analyzeSentiment({ document })
}

export const analyzeEntitySentiment = (text) => {
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    }
    return client.analyzeEntitySentiment({ encodingType: "UTF8", document: document })
}


