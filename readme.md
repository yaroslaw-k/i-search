# ISearch Proof of Concept

This is a small proof of concept project that demonstrates how to create an intelligent search for a website using the Universal Sentence Encoder from TensorFlow.js. In this example, the website "gcore.com" is used as a sample dataset.

## Getting Started

To run this project, follow these steps:

1. Clone the repository or download the project files.

2. Open the `index.html` file in a web browser.

3. Wait for the model to load (this might take a few seconds).

4. Enter a search query in the input field and click the "go" button.

5. The search results will be displayed based on the similarity of your query with the website pages.

## Code Overview

- `script.js`: This JavaScript file contains the main functionality of the project. It loads the Universal Sentence Encoder model, processes the dataset, and performs similarity calculations for search queries.

- `pages.json`: This JSON file contains the dataset of website pages. Each page has a title, URL, and a list of texts.

- `style.css`: This CSS file defines the styling for the user interface.

## User Interface

- The input field allows users to enter search queries.

- The "go" button triggers the search based on the entered query.

- The loader displays status messages, such as model loading and search progress.

- The search results are displayed on the left side, with links to the relevant pages.

## Search Algorithm

The search algorithm calculates similarity scores between the user's query and the titles and texts of website pages. It ranks the pages based on these scores and displays the top results.

- Top results by titles: Pages with the highest similarity scores in terms of titles.

- Top results by average text similarity: Pages with the highest average similarity scores across their texts.

- Top results by the most similar text: Pages with the highest similarity scores for their most similar text.

## Note

This is a proof of concept project and uses a simplified dataset. In a real-world scenario, you would need to adapt the code to work with a larger and more diverse dataset.
