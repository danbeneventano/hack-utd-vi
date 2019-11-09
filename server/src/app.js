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
        Math.abs(entity.sentiment.magnitude) > 1);
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
    for(let i = 0; i < entityNames.length; ++i){
        console.log(entityNames[i]);
        console.log();
        filteredEntities[i].description = " fdf"
    }
    res.status(200).send({ entities: filteredEntities});






    // res.status(200).send(entities: entityNames);
    // res.status(200).send(sentimentMagnitude);

})

app.listen(3000, () => console.log('Server listening on port 3000'))
