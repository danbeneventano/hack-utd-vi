import express from "express"
import cors from "cors"
import { analyzeSentiment, analyzeEntitySentiment } from "./analysis"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const router = express.Router()
app.use("/api", router)

router.get("/analyze", async (req, res) => {
    const { text } = req.body
    const sentiment = await analyzeSentiment(text)
    res.status(200).send(sentiment)
})

router.get("/analyzeEntities", async (req, res) => {
    const { text } = req.body
    const [result] = await analyzeEntitySentiment(text)
    const filteredEntities = result.entities.filter(entity =>
        Math.abs(entity.sentiment.magnitude) > .2);
    //res.status(200).send({ entities: filteredEntities});
    //result.blah.description = "what"
    let entityNames = [];
    let sentimentMagnitude = [];
    let sentimentScore = [];
    for (const entity of filteredEntities) {
        entityNames.push(`${entity.name}`);
        sentimentMagnitude.push(entity.sentiment.magnitude);
        sentimentScore.push(entity.sentiment.score);
    }
    console.log(text.length + ": " + entityNames.length);
    for(let i = 0; i < entityNames.length; ++i){
        if(Math.abs(sentimentScore[i]) < 0.02 && sentimentMagnitude[i] < 3){
            filteredEntities[i].description = "The text provides a mixed bias on this."
        }else if(sentimentScore[i] > 0.3 && sentimentMagnitude[i] > 3 ){
            filteredEntities[i].description = "The text provides a clearly positive bias on this."
        }else if(sentimentScore[i] > 0.3 && (sentimentMagnitude[i] < 3 && sentimentMagnitude > 1.75)){
            filteredEntities[i].description = "The text provides a positive bias on this."
        }else if(sentimentScore[i] < -0.3 && sentimentMagnitude[i] > 3 ){
            filteredEntities[i].description = "The text provides a clearly negative bias on this."
        }else if(sentimentScore[i] < -0.3 && (sentimentMagnitude[i] < 3 && sentimentMagnitude > 1.75)){
            filteredEntities[i].description = "The text provides a negative bias on this."
        }
    }

    res.status(200).send({ entities:  result.entities.filter(entity =>
            entity.description)});


})

app.listen(3000, () => console.log('Server listening on port 3000'))
