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
    const sentiment = await analyzeSentiment(text)
    res.status(200).send(sentiment)
})

router.post("/analyzeEntities", async (req, res) => {
    const { text } = req.body
    const [result] = await analyzeEntitySentiment(text)
    res.status(200).send({ entities: result.entities.filter(entity =>
            Math.abs(entity.sentiment.magnitude) > 1) })
})

app.listen(3000, () => console.log('Server listening on port 3000'))
