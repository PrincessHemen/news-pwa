const main = document.querySelector('main')
const sourceSelector = document.querySelector('#sourceSelector')
const defaultSource = 'the-washington-post'

window.addEventListener('load', e => {
    updateNews()
    updateSources()
    sourceSelector.value = defaultSource 

    sourceSelector.addEventListener('change', e => {
        updateNews(e.target.value)
    })

    if ('serviceWorker' in navigator) {
        try {
            navigator.serviceWorker.register('sw.js')
            console.log('Service Worker registered')
        } catch (error) {
            console.log('Service Worker registration failed')
        }
    }
})

async function updateSources() {
    const res = await fetch(`/api/sources`)
    const json = await res.json()

    if (!json.sources) {
        console.log(json);
        return;
    }

    console.log("Sources received:", json);

    sourceSelector.innerHTML = json.sources.map(src => `<option value=${src.id}>${src.name}</option>`).join('\n')
}

async function updateNews(source = defaultSource) {
    main.innerHTML = ''; // Clear old news immediately
    try {
        const res = await fetch(`/api/news?source=${source}`)
        const json = await res.json() 

        if (!json.articles) {
            console.log(json);
            main.innerHTML = "<p>Failed to load news.</p>";
            return;
        }

        main.innerHTML = json.articles.map(createArticle).join('\n')
    } catch (error) {
        console.log('Fetch failed, loading fallback:', error)
        try {
            const fallback = await fetch('./fallback.json')
            const json = await fallback.json()
            main.innerHTML = json.articles.map(createArticle).join('\n')
        } catch (fallbackError) {
            main.innerHTML = '<p>You are offline and no cache is available.</p>'
        }
    }

    

    function createArticle(article) {
        return `
            <div class="article">
                <a href="${article.url}">
                    <h2>${article.title}</h2>
                    <img src="${article.urlToImage}">
                    <p>${article.description}</p>
                </a>
            </div>
        `
    }
}