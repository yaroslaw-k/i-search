document.addEventListener('DOMContentLoaded', function () {
    const statusElement = document.getElementById('status');
    const inputElement = document.getElementById('input');
    const outputElement = document.getElementById('output');
    const pagesElement = document.getElementById('pages');
    const doButton = document.getElementById('do');

    statusElement.textContent = 'Loading model, it will take some tens of seconds';

    async function loadModel() {
        let dataset = [];
        const model = await use.load();
        statusElement.textContent = 'Loading dataset, it will take some seconds';

        const response = await fetch('pages.json');
        const pages = await response.json();
        pages.forEach(page => {
            dataset.push({
                title: {
                    value: page.title, tensor: null
                }, url: page.url, texts: page.texts.map(text => ({
                    value: text, tensor: null
                }))
            });
        });

        statusElement.textContent = 'Warming up model';
        await model.embed('hello');


        async function processPages(pages, model) {
            const batchSize = 3;
            const processedPages = [];

            for (let i = 0; i < pages.length; i += batchSize) {
                const batch = pages.slice(i, i + batchSize);
                statusElement.textContent = `Calculating embeddings ${i} / ${pages.length}, it will take some minutes`;
                const processedBatch = await Promise.all(batch.map(async page => {
                    page.title.tensor = await model.embed(page.title.value);
                    page.texts = await Promise.all(page.texts.map(async text => {
                        text.tensor = await model.embed(text.value);
                        return text;
                    }));
                    return page;
                }));
                processedPages.push(...processedBatch);
            }

            return processedPages;
        }



        dataset = await processPages(dataset, model);


        pagesElement.innerHTML = '<h3>Data set</h3>';

        for (const page of dataset) {
            const pageElement = document.createElement('div');
            pageElement.innerHTML = `${page.url}`;
            pagesElement.appendChild(pageElement);
        }


        statusElement.textContent = 'Ready';

        doButton.addEventListener('click', async () => {
            outputElement.innerHTML = '';
            const userQuery = inputElement.value.trim();

            if (userQuery === '') {
                alert('Please enter a query');
                return;
            }

            const userQueryEmbedding = await model.embed(userQuery);

            const results = [];

            dataset.forEach((page, index) => {
                statusElement.textContent = `Calculating similarity  ${index} / ${dataset.length}`;
                const titleScore = tf.matMul(userQueryEmbedding, page.title.tensor, false, true).dataSync()[0];
                const textScores = page.texts.map(text => tf.matMul(userQueryEmbedding, text.tensor, false, true).dataSync()[0]);
                const topTextScore = textScores.reduce((a, b) => a > b ? a : b);
                results.push({title: page.title.value, url: page.url, score: {textScores, titleScore, topTextScore}});
            });

            const topCount = 5;

            const topByTitles = results.sort((a, b) => b.score.titleScore - a.score.titleScore).slice(0, topCount);
            const topByAvgTexts = results.sort((a, b) => (b.score.textScores.reduce((a, b) => a + b, 0)) / b.score.textScores.length - (a.score.textScores.reduce((a, b) => a + b, 0)) / a.score.textScores.length).slice(0, topCount);
            const topByTopText = results.sort((a, b) => b.score.topTextScore - a.score.topTextScore).slice(0, topCount);

            outputElement.innerHTML = `<h3>Top ${topCount} by titles</h3>`;
            for (const result of topByTitles) {
                const resultElement = document.createElement('div');
                resultElement.innerHTML = `${result.score.titleScore.toFixed(3)} <a target="_blank" href="${result.url}" class="result-link">${result.title}</a> `;
                outputElement.appendChild(resultElement);
            }

            outputElement.innerHTML += `<h3>Top ${topCount} by avg texts</h3>`;
            for (const result of topByAvgTexts) {
                const resultElement = document.createElement('div');
                resultElement.innerHTML = `${(result.score.textScores.reduce((a, b) => a + b, 0) / result.score.textScores.length).toFixed(3)} <a target="_blank" href="${result.url}" class="result-link">${result.title}</a>`;
                outputElement.appendChild(resultElement);
            }


            outputElement.innerHTML += `<h3>Top ${topCount} by top text</h3>`;
            for (const result of topByTopText) {
                const resultElement = document.createElement('div');
                resultElement.innerHTML = `${result.score.topTextScore.toFixed(3)} <a target="_blank" href="${result.url}" class="result-link">${result.title}</a>`;
                outputElement.appendChild(resultElement);
            }

            statusElement.textContent = 'done!';
        });
    }

    loadModel();
});
