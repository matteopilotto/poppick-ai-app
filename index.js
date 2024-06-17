import { marked } from "marked"

const form = document.querySelector('form');
const submitButton = document.getElementById("submit-button");
const questionnaire = document.querySelector('.questionnaire-container');
const loadingPar = document.querySelector(".loading-paragraph")
const responseContainer = document.querySelector('.response-container');
const textResponse = document.querySelector(".response")
const posterContainer = document.querySelector(".poster-container")
const refreshButton = document.getElementById("refresh-button")

const question1 = document.querySelector('label[for="question1"]').innerHTML
const question2 = document.querySelector('label[for="question2"]').innerHTML
const question3 = document.querySelector('label[for="question3"]').innerHTML
const answer1 = document.getElementById('question1');
const answer2 = document.getElementById('question2');
const answer3 = document.getElementById('question3');


refreshButton.addEventListener("click", function(e) {
    e.preventDefault()
    responseContainer.style.display = "none"
    posterContainer.innerHTML = "" // this cleans up the container by removing the appended poster images
    form.reset()
    questionnaire.style.display = "flex"
})


submitButton.addEventListener("click", function(e) {
    e.preventDefault();
    const user_input = `${question1} ${answer1.value}\n${question2} ${answer2.value}\n${question3} ${answer3.value}`
    questionnaire.style.display = "none"
    loadingPar.style.display = "flex"
    main(user_input);
})

async function main(input) {
    try {
        const embedding = await createEmbedding(input)
        // console.log(`input embedding: ${embedding}`)

        const data = await findNearestMatch(embedding)
        // console.log(data)

        const movie_info = data.map(obj => obj.context).join("\n\n");
        const posters = data.map(obj => obj.poster);
        const tmdb_ids = data.map(obj => obj.tmdb_id);
        
        const llmResponse = await getChatCompletion(input, movie_info);
        
        textResponse.innerHTML = marked.parse(llmResponse)

        for (const [index, poster_url] of posters.entries()) {
            const img = document.createElement("img")
            img.src = poster_url
            img.setAttribute("class", "poster")
            // img.setAttribute("href", `https://www.themoviedb.org/movie/${tmdb_ids[index]}`)
            img.onclick = function() {
              window.open(`https://www.themoviedb.org/movie/${tmdb_ids[index]}`, "_blank")
            }

            posterContainer.appendChild(img)
        }

        loadingPar.style.display = "none"
        responseContainer.style.display = "flex"        
    } catch (error) {
        console.error('Error in main function.', error.message);
        textResponse.innerHTML = 'Sorry, something went wrong. Please try again.'
    }
}

async function createEmbedding(input) {

    try {
        const url = "https://poppick-openai-embedding-worker.matteo-pilotto.workers.dev/"

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(input)
        })

        const data = await response.json()
        return data

    } catch(error) {
        console.error(error.message)
        // loadingArea.innerText = "Unable to access AI. Please refresh and try again."
    }

    return embeddingResponse.data[0].embedding;
}

async function findNearestMatch(embedding) {
    try {
        const url = "https://supabase-worker.matteo-pilotto.workers.dev/"

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(embedding)
        })

        const data = await response.json()
        // console.log(data)

        return data

    } catch(error) {
        console.error(error.message)
    }
}

const chatMessages = [{
role: 'system',
content: `
You are an enthusiastic movie expert who loves recommending movies to people based on their taste.
You will receive as input a series of questions and answers that describes the user's preferences.
In addition to that, you will also receive information about movies that the user might like.
Use that information to provide a friendly and compelling response to recommend those movies to the user.
For each movie write no more than two sentences to keep everything short and concise.
Do not add any comment before or after the recommeded list of movies.
If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer."
Please do not make up the answer.
Stringly follow this example output to format your response:
1. **All Fun and Games (2023)** - Immerse yourself in a chilling adventure with this horror thriller where teens in Salem encounter a demonic curse through a sinister game. It’s a fresh take on the horror genre with a deadly twist that promises to keep you on the edge of your seat.
2. **Deep Fear (2023)** - Set sail on a spine-tingling journey with "Deep Fear," where a peaceful solo yacht trip turns into a nightmare involving drug traffickers and shark-infested waters. Its combination of horror, action, and mystery makes it an intense watch that's sure to thrill.
3. **Talk to Me (2023)** - Dive into the supernatural with "Talk to Me," where a seemingly fun spirit conjuring with friends spirals into a horrifying ordeal. This film not only scares but intrigues with its deep dive into the consequences of meddling with the unknown.

`.trim()
}]

async function getChatCompletion(input_query, movie_info) {
    chatMessages.push({
        role: "user",
        content: `User's Preferences:\n${input_query}\n\nSuggested Movies:\n${movie_info}`
    });

    try {
        const url = "https://openai-api-worker.matteo-pilotto.workers.dev"

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(chatMessages)
        })

        const data = await response.json()
        console.log(data)
        return data.content
    } catch(error) {
        console.error(error.message)
        // loadingArea.innerText = "Unable to access AI. Please refresh and try again."
    }

    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
}