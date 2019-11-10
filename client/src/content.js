import axios from "axios"
import {API_URL} from "./api-url"
import htmlArticleExtractor from 'html-article-extractor'

let objects = []
let overallData = null

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case "analyzePage":
            if (overallData) {
                chrome.runtime.sendMessage({
                    type: "emotionScore",
                    emotionScore: overallData.emotionScore,
                    overallDescription: overallData.description
                })
                return
            }
            let text = await new Promise((resolve, reject) => {
                let {text} = htmlArticleExtractor(window.document.body)
                text = text.replace(/(\r\n|\n|\r)/gm, "")
                resolve(text)
            })
            let entityData = (await axios.post(`${API_URL}/analyzeEntities`, {text})).data
            overallData = (await axios.post(`${API_URL}/analyze`, {text})).data
            console.log(entityData)
            console.log(overallData)
            let highlighted = false
            if (entityData.entities.length > 0) {
                highlighted = true
                for (const entity of entityData.entities) {
                    objects.push(
                        {
                            regex: new RegExp('\\b(' + entity.name + ')\\b'),
                            description: entity.description,
                            mentionText: entity.name
                        })
                }
                await processDocumentv2()
            }
            chrome.runtime.sendMessage({
                    type: "emotionScore",
                    emotionScore: overallData.emotionScore,
                    overallDescription: overallData.description,
                    highlighted: highlighted
                })
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

    for (const obj of objects) {
        obj.regex.lastIndex = 0
        newHtml = newHtml.replace(obj.regex,
            '<span style="background-color: yellow" aria-label=$description data-balloon-pos="up">$1</span>'
                .replace("$description", '"' + obj.description + '"')
                .replace("$mentionText", obj.mentionText));
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
