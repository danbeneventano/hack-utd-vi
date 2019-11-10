import express from "express"
import cors from "cors"
import { analyzeSentiment, analyzeEntitySentiment } from "./analysis"

const app = express()

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 50000 }))
app.use(cors())

const router = express.Router()
app.use("/api", router)


router.post("/analyze", async (req, res) => {
    const { text } = req.body
    const [sentiment] = await analyzeSentiment(text)
    const magnitude = sentiment.documentSentiment.magnitude;
    const score = sentiment.documentSentiment.score;
    const max = 0.01 * text.length;
    const emotionScore =(magnitude / max * 100);
    sentiment.emotionScore = Math.round(emotionScore);
    if(score > .7 &&  emotionScore > 50){
        sentiment.description = "The text provides mixed bias."
    }else if(score > 0.3  &&  emotionScore > 50  ){
        sentiment.description = "The text is clearly positive."
    }else if(score > 0 && emotionScore > 25 ){
        sentiment.description = "The text is fairly positive."
    }else if(score < -0.3 && emotionScore > 50 ){
        sentiment.description = "The text is clearly negative."
    }else if(score < 0 &&  emotionScore > 25) {
        sentiment.description = "The text is fairly negative."
    }else if(score < .75 && emotionScore <= 50){
        sentiment.description = "The text is fairly neutral."
    }
    console.log(`${magnitude} is magnitude and ${score} is score`);
    res.status(200).send(sentiment)
})

router.post("/analyzeEntities", async (req, res) => {
    const { text } = req.body
    const [result] = await analyzeEntitySentiment(text)
    const filteredEntities = result.entities.filter(entity =>
        Math.abs(entity.sentiment.magnitude) > 0);
    //res.status(200).send({ entities: filteredEntities});
    //result.blah.description = "what"
    let entityNames = [];
    let sentimentMagnitude = [];
    let sentimentScore = [];
    for (const entity of filteredEntities) {
        entityNames.push(`${entity.name}`);
        sentimentMagnitude.push(entity.sentiment.magnitude);
        sentimentScore.push(entity.sentiment.score);
        // Loops through each mention in each entity and evaluates if there is bias from the sentiment scores
        for(const mention of entity.mentions){
            if(mention.sentiment.magnitude > .7 && Math.abs(mention.sentiment.score) < 0.002){
                mention.description = "The text provides a mixed bias on this."
            }else if(mention.sentiment.score > 0.3 && mention.sentiment.magnitude > .7 ){
                mention.description = "The text provides a clearly positive bias on this."
            }else if(mention.sentiment.score > 0.3 && (mention.sentiment.magnitude < .2 && mention.sentiment.magnitude > .7)){
                mention.description = "The text provides a positive bias on this."
            }else if(mention.sentiment.score < -0.3 && mention.sentiment.magnitude > .7 ){
                mention.description = "The text provides a clearly negative bias on this."
            }else if(mention.sentiment.score < -0.3 && (mention.sentiment.magnitude < .2 && mention.sentiment.magnitude > .7)){
                mention.description = "The text provides a negative bias on this."
            }
        }
    }
    //console.log(text.length + ": " + entityNames.length);

    //Loops through each name and says if that topic and describes if there is bias from the total sentiment scores.
    for(let i = 0; i < entityNames.length; ++i){
        if(Math.abs(sentimentScore[i]) < 0.002 && sentimentMagnitude[i] > 3){
            filteredEntities[i].description = "The text provides a mixed bias on this."
        }else if(sentimentScore[i] > 0.3 && sentimentMagnitude[i] > 3 ){
            filteredEntities[i].description = "The text provides a clearly positive bias on this."
        }else if(sentimentScore[i] > 0.3 && (sentimentMagnitude[i] < 3 && sentimentMagnitude[i] > 1)){
            filteredEntities[i].description = "The text provides a positive bias on this."
        }else if(sentimentScore[i] < -0.3 && sentimentMagnitude[i] > 3 ){
            filteredEntities[i].description = "The text provides a clearly negative bias on this."
        }else if(sentimentScore[i] < -0.3 && (sentimentMagnitude[i] < 3 && sentimentMagnitude[i] > 1)){
            filteredEntities[i].description = "The text provides a negative bias on this."
        }
    }

    res.status(200).send({ entities:  result.entities.filter(entity =>
            entity.description)});

})

app.listen(3000, () => console.log('Server listening on port 3000'))
