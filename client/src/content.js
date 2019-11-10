import axios from "axios"
import {API_URL} from "./api-url"
import htmlArticleExtractor from 'html-article-extractor'
import { phrases, problematicPhraseColor } from "./problematic-phrases";

let objects = []
let map = new Map()
let overallData = null
let sentDoc = null
const phrasesRegExpText = '\\b(' + phrases.join('|') + ')\\b'
const phrasesRegExp = new RegExp(phrasesRegExpText ,'mgi')


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case "analyzePage":
            if (sentDoc) {
                chrome.runtime.sendMessage(sentDoc)
                return
            }
            let text = await new Promise((resolve, reject) => {
                let {text} = htmlArticleExtractor(window.document.body)
                text = text.replace(/(\r\n|\n|\r)/gm, "")
                resolve(text)
            })
            let entityData = (await axios.post(`${API_URL}/analyzeEntities`, {text})).data
            overallData = (await axios.post(`${API_URL}/analyze`, {text})).data
            let highlighted = false
            let mentions = 0
            if (entityData.entities.length > 0) {
                highlighted = true
                for (const entity of entityData.entities) {
                    for (const mention of entity.mentions) {
                        mentions++
                        console.log(mention.sentiment.magnitude)
                        if (!map.has(entity.name)) {
                            map.set(entity.name,
                                {
                                    regex: new RegExp('\\b(' + mention.text.content + ')\\b'),
                                    descriptions: [{ text: mention.description, color: mention.color }],
                                    descriptionIndex: 0
                                })
                        } else {
                            map.get(entity.name)
                                .descriptions
                                .push({ text: mention.description, color: mention.color })
                        }
                    }

                    objects.push(
                        {
                            regex: new RegExp('\\b(' + entity.name + ')\\b'),
                            description: entity.description,
                            mentionText: entity.name
                        })
                }
                await processDocumentv2()
            }
            sentDoc = {
                type: "emotionScore",
                emotionScore: overallData.emotionScore,
                description: overallData.description,
                highlighted: highlighted,
                color: overallData.color,
                highlightCount: mentions
            }
            chrome.runtime.sendMessage(sentDoc)
            break
        default:
            break
    }
})

function handleTextNode(textNode) {
    if (textNode.nodeName !== '#text'
        || textNode.parentNode.nodeName === 'SCRIPT'
        || textNode.parentNode.nodeName === 'STYLE'
    ) {
        //Don't do anything except on text nodes, which are not children
        //  of <script> or <style>.
        return;
    }

    let origText = textNode.textContent
    let newHtml = origText

    phrasesRegExp.lastIndex = 0
    newHtml = origText.replace(phrasesRegExp,
        '<span style="background-color: $color" aria-label="This word/phrase is often used in emotional or opinionated context." data-balloon-pos="up">$1</span>'
            .replace("$color", problematicPhraseColor));

    for (const [key, value] of map.entries()) {
        value.regex.lastIndex = 0
        const old = newHtml
        if (value.descriptionIndex >= value.descriptions.length) continue
        if (!value.descriptions[value.descriptionIndex]) {
            value.descriptionIndex++
            continue
        }
        newHtml = newHtml.replace(value.regex,
            '<span style="background-color: $color" aria-label=$description data-balloon-pos="up">$1</span>'
                .replace("$description", '"' + value.descriptions[value.descriptionIndex].text + '"')
                .replace("$color", value.descriptions[value.descriptionIndex].color));
        if (old !== newHtml) {
            value.descriptionIndex++
        }
    }

    //Only change the DOM if we actually made a replacement in the text.
    //Compare the strings, as it should be faster than a second RegExp operation and
    //  lets us use the RegExp in only one place for maintainability.
    if (newHtml !== origText) {
        setTimeout(() => {
            let newSpan = document.createElement('span');
            newSpan.innerHTML = newHtml;
            textNode.parentNode.replaceChild(newSpan, textNode);
        }, 0)
    }
}

function processDocumentv2() {
    return new Promise((resolve, reject) => {
        let textNodes = [];
        //Create a NodeIterator to get the text nodes in the body of the document
        let nodeIter = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT);
        let currentNode;
        //Add the text nodes found to the list of text nodes to process.
        while (currentNode = nodeIter.nextNode()) {
            textNodes.push(currentNode);
        }
        //Process each text node
        textNodes.forEach(function (el) {
            handleTextNode(el);
        });
        resolve()
    })
}
