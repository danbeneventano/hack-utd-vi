import express from "express"
import cors from "cors"
import {analyzeSentiment, analyzeEntitySentiment} from "./analysis"

const app = express()

app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true, limit: "50mb", parameterLimit: 50000}))
app.use(cors())

const router = express.Router()
app.use("/api", router)


router.post("/analyze", async (req, res) => {
    const {text} = req.body
    const [sentiment] = await analyzeSentiment(text)
    const magnitude = sentiment.documentSentiment.magnitude;
    const score = sentiment.documentSentiment.score;
    const max = 0.0035 * text.length;
    const emotionScore = Math.min(Math.max(Math.round(magnitude / max * 100), 0), 100);
    sentiment.emotionScore = emotionScore;
    if (emotionScore < 25) {
        sentiment.description = "The text does not have much emotion."
    } else if (score <= .3 && score >= -.3 && emotionScore < 50) {
        sentiment.description = "The text contains fairly mixed emotions."
    } else if (score <= .3 && score >= -.3 && emotionScore >= 50) {
        sentiment.description = "The text contains highly mixed emotions."
    } else if (score > .3 && emotionScore < 50) {
        sentiment.description = "The text contains fairly positive emotion."
    } else if (score > .3 && emotionScore >= 50) {
        sentiment.description = "The text contains clearly positive emotion."
    } else if (score < -0.3 && emotionScore < 50) {
        sentiment.description = "The text contains fairly negative emotion."
    } else if (score < -.3 && emotionScore >= 50) {
        sentiment.description = "The text contains clearly negative emotion."
    }

    if (emotionScore <= 25) {
        sentiment.color = "#4CAF50"
    } else if (emotionScore > 25 && emotionScore <= 50) {
        sentiment.color = "#FF9800"
    } else if (emotionScore > 50) {
        sentiment.color = "#F44336"
    }

    res.status(200).send(sentiment)
})

router.post("/analyzeEntities", async (req, res) => {
    const {text} = req.body
    const [result] = await analyzeEntitySentiment(text)
    const filteredEntities = result.entities.filter(entity =>
        Math.abs(entity.sentiment.magnitude) > 0);
    let entityNames = [];
    let sentimentMagnitude = [];
    let sentimentScore = [];
    for (const entity of filteredEntities) {
        entityNames.push(`${entity.name}`);
        sentimentMagnitude.push(entity.sentiment.magnitude);
        sentimentScore.push(entity.sentiment.score);

        const newMentions = []

        // Loops through each mention in each entity and evaluates if there is bias from the sentiment scores
        for (let i in entity.mentions) {
            const mention = entity.mentions[i]
            let description
            const score = mention.sentiment.score

            const fairlyColor = "#ffc947"
            const clearlyColor = "#ff867c"

            if (score >= .1 && score < .45) {
                description = "This appears to be mentioned in the context of fairly positive emotion."
                Object.assign(mention, { description: description, color: fairlyColor })
            } else if (score >= .45 && score <= 1) {
                description = "This appears to be mentioned in the context of clearly positive emotion."
                Object.assign(mention, { description: description, color: clearlyColor })
            } else if (score <= -.1 && score > -.45) {
                description = "This appears to be mentioned in the context of fairly negative emotion."
                Object.assign(mention, { description: description, color: fairlyColor })
            } else if (score <= -.45 && score >= -1) {
                description = "This appears to be mentioned in the context of clearly negative emotion."
                Object.assign(mention, { description: description, color: clearlyColor })
            }
            newMentions.push(mention)
        }
        entity.mentions = newMentions
    }

    //Loops through each name and says if that topic and describes if there is bias from the total sentiment scores.
    for (let i in entityNames) {
        if (Math.abs(sentimentScore[i]) < 0.002 && sentimentMagnitude[i] > 3) {
            filteredEntities[i].description = "The text provides a mixed bias on this."
        } else if (sentimentScore[i] > 0.3 && sentimentMagnitude[i] > 3) {
            filteredEntities[i].description = "The text provides a clearly positive bias on this."
        } else if (sentimentScore[i] > 0.3 && (sentimentMagnitude[i] < 3 && sentimentMagnitude[i] > 1)) {
            filteredEntities[i].description = "The text provides a positive bias on this."
        } else if (sentimentScore[i] < -0.3 && sentimentMagnitude[i] > 3) {
            filteredEntities[i].description = "The text provides a clearly negative bias on this."
        } else if (sentimentScore[i] < -0.3 && (sentimentMagnitude[i] < 3 && sentimentMagnitude[i] > 1)) {
            filteredEntities[i].description = "The text provides a negative bias on this."
        }
    }

    res.status(200).send({
        entities: result.entities.filter(entity =>
            entity.description)
    });

})

app.listen(3000, () => console.log('Server listening on port 3000'))
