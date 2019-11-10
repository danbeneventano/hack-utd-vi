import axios from "axios"
import {API_URL} from "./api-url"
import htmlArticleExtractor from 'html-article-extractor'

let objects = []

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log("received")
    let text = await new Promise((resolve, reject) => {
        let {text} = htmlArticleExtractor(window.document.body)
        text = text.replace(/(\r\n|\n|\r)/gm, "")
        resolve(text)
    })
    let {data} = await axios.post(`${API_URL}/analyzeEntities`, { text })
    console.log(data)
    for (const entity of data.entities) {
        objects.push(
            {
                regex: new RegExp('\\b(' + entity.name + ')\\b'),
                description: `magnitude: ${entity.sentiment.magnitude.toString()} score: ${entity.sentiment.score.toString()}`,
                mentionText: entity.name
            })
    }
    processDocumentv2()
})

let i = 0

function handleTextNode(textNode) {
    if(textNode.nodeName !== '#text'
        || textNode.parentNode.nodeName === 'SCRIPT'
        || textNode.parentNode.nodeName === 'STYLE'
    ) {
        //Don't do anything except on text nodes, which are not children
        //  of <script> or <style>.
        return;
    }

    let origText = textNode.textContent//.substring(currentOffset);
    //currentOffset = origText.indexOf(mentionText) + mentionText.length
    //console.log(mentionText)
    //console.log(origText)
    //let newHtml=origText.replace(new RegExp(`\b/${mentionText}\b/`), "")
    //const index = origText.indexOf(mentionText)
    /*if (index !== -1) {
        console.log(`mentionText: ${mentionText}`)
        console.log(`length: ${mentionText.length}`)
        console.log(`index: ${index}`)
        console.log(origText.substring(index, mentionText.length))
    }*/
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
    if(newHtml !== origText) {
        let newSpan = document.createElement('span');
        newSpan.innerHTML = newHtml;
        textNode.parentNode.replaceChild(newSpan,textNode);
    }
}

function processDocumentv2() {
    let textNodes = [];
//Create a NodeIterator to get the text nodes in the body of the document
    let nodeIter = document.createNodeIterator(document.body,NodeFilter.SHOW_TEXT);
    let currentNode;
//Add the text nodes found to the list of text nodes to process.
    while(currentNode = nodeIter.nextNode()) {
        textNodes.push(currentNode);
    }
//Process each text node
    textNodes.forEach(function(el){
        handleTextNode(el);
    });
}
