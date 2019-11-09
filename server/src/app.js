import express from "express"
import cors from "cors"
import { analyzeSentiment } from "./analysis"

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

app.listen(3000, () => console.log('Server listening on port 3000'))
