<script>
  import { onMount } from "svelte";
  import { Configuration, OpenAIApi } from "openai";
  import {
    select,
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
  } from "d3";
  import * as Plotly from "plotly.js-dist";

  const configuration = new Configuration({
    apiKey: "HERE GOES YOUR API KEY",
  });

  const openai = new OpenAIApi(configuration);

  let showResults = false;

  let inputText = "";
  let analysisResults = [];

  async function analyzeAndSave() {
    const prompt = `Given the following text, please perform the following analyses and return the results in JSON format:
        Analyze the sentiment of the text and return the sentiment score on a scale of -1 to 1.
        Identify the named entities present in the text and return their corresponding entity types (e.g. person, organization, location).
        Identify the topics present in the text and return the top 5 most relevant topics and their corresponding scores.
        Generate a list of keywords or tags that represent the main concepts or themes of the text.
        
        Text: ${inputText}

        {
          "sentiment_score": 0.0,
          "named_entities": [
            {
              "text": "",
              "type": ""
            }
          ],
          "topics": [
            {
              "text": "",
              "score": 0.0
            }
          ],
          "keywords": [
            ""
          ]
        }`;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const jsonResponse = JSON.parse(response.data.choices[0].message.content);
    analysisResults.push(jsonResponse);
    console.log(analysisResults);
    updateAnalysisResults();
  }


  function updateAnalysisResults() {
    if(!document.getElementById("results-container")) return;
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = "";

    analysisResults.forEach((result, index) => {
      const resultElem = document.createElement("div");
      resultElem.innerHTML = `
      <h3>Result ${index + 1}</h3>
      <h4>Sentiment Score</h4>
      <p>${result.sentiment_score}</p>
      <h4>Named Entities</h4>
      <ul>${result.named_entities
        .map((entity) => `<li>${entity.text} (${entity.type})</li>`)
        .join("")}</ul>
      <h4>Topics</h4>
      <ul>${result.topics
        .map((topic) => `<li>${topic.text} (score: ${topic.score})</li>`)
        .join("")}</ul>
      <h4>Keywords</h4>
      <ul>${result.keywords
        .map((keyword) => `<li>${keyword}</li>`)
        .join("")}</ul>
    `;
      resultsContainer.appendChild(resultElem);
    });

    // Update charts
    if (analysisResults.length > 0) {
      const latestTopics = analysisResults[analysisResults.length - 1].topics;
      console.log("updated with:" + latestTopics);
      createBarChart(latestTopics);
      createPieChart(latestTopics);
      createScatterPlot(latestTopics);
      create3DPlot(latestTopics);
      create3DPlotScatter(latestTopics);
      create3DAxesDiagram(latestTopics);
      create3DSurfacePlot(latestTopics);
    }
  }

  onMount(() => {
    setInterval(() => {
      
    }, 1000);
  });

  function createBarChart(data) {
    if (!data) return;
    const trace = {
      x: data.map((d) => d.text),
      y: data.map((d) => d.score),
      type: "bar",
    };

    const layout = {
      title: "Topics and their Scores",
      xaxis: { title: "Topics" },
      yaxis: { title: "Scores" },
    };

    Plotly.newPlot("bar-chart", [trace], layout);
  }

  function createPieChart(data) {
    if (!data) return;
    const trace = {
      labels: data.map((d) => d.text),
      values: data.map((d) => d.score),
      type: "pie",
    };

    const layout = {
      title: "Topics Distribution",
    };

    Plotly.newPlot("pie-chart", [trace], layout);
  }

  function createScatterPlot(data) {
  if (!data) return;
  const trace = {
    x: data.map((d, i) => i),
    y: data.map((d) => d.score),
    mode: "markers",
    type: "scatter",
    text: data.map((d) => d.text),
    marker: { size: 10 },
  };

  const layout = {
    title: "Scatter Plot of Topic Scores",
    xaxis: { title: "Index" },
    yaxis: { title: "Scores" },
  };

  const scatterPlotDiv = document.getElementById("scatter-plot");
  scatterPlotDiv.style = {}; // Remove inline styles

  Plotly.newPlot("scatter-plot", [trace], layout);
}

function create3DPlot(data) {
  if (!data) return;
  const trace = {
    x: data.map((d) => d.text),
    y: data.map((d) => d.score),
    z: data.map((d, i) => i),
    type: "bar3d",
  };

  const layout = {
    title: "3D Bar Chart of Topic Scores",
    scene: {
      xaxis: { title: "Topics" },
      yaxis: { title: "Scores" },
      zaxis: { title: "Index" },
    },
  };

  const barChart3dDiv = document.getElementById("bar-chart-3d");
  barChart3dDiv.style = {}; // Remove inline styles

  Plotly.newPlot("bar-chart-3d", [trace], layout);
}

function create3DPlotScatter(data) {
  if (!data) return;
  const trace = {
    x: data.map((d) => d.text),
    y: data.map((d) => d.score),
    z: data.map((d, i) => i),
    mode: "markers",
    type: "scatter3d",
    text: data.map((d) => d.text),
    marker: { size: 3 },
  };

  const layout = {
    title: "3D Scatter Plot of Topic Scores",
    scene: {
      xaxis: { title: "Topics" },
      yaxis: { title: "Scores" },
      zaxis: { title: "Index" },
    },
  };

  const scatterPlot3dDiv = document.getElementById("scatter-plot-3d");
  scatterPlot3dDiv.style = {}; // Remove inline styles

  Plotly.newPlot("scatter-plot-3d", [trace], layout);
}

function create3DAxesDiagram(data) {
  if (!data) return;
  const trace = {
    x: data.map((d, i) => i),
    y: data.map((d) => d.score),
    z: data.map((d) => d.text.length), // You can use any other metric if needed
    mode: "markers",
    type: "scatter3d",
    text: data.map((d) => d.text),
    marker: { size: 5 },
  };

  const layout = {
    title: "3D Axes Diagram",
    scene: {
      xaxis: { title: "Index" },
      yaxis: { title: "Scores" },
      zaxis: { title: "Text Length" }, // Update the title based on the metric you use
    },
  };

  const axes3dDiv = document.getElementById("axes-3d");
  axes3dDiv.style = {}; // Remove inline styles

  Plotly.newPlot("axes-3d", [trace],layout);
}

function create3DSurfacePlot(data) {
  if (!data) return;

  const z_data = data.map((d) => {
    return [d.score, d.text.length];
  });

  const trace = {
    z: z_data,
    type: "surface",
  };

  const layout = {
    title: "3D Surface Plot of Topic Scores and Text Length",
    scene: {
      xaxis: { title: "Scores" },
      yaxis: { title: "Text Length" },
      zaxis: { title: "Value" },
    },
  };

  const config = {
    responsive: true,
  };

  Plotly.newPlot("surface-plot-3d", [trace], layout, config);
}



</script>

<main>
  <h1>Text Analysis</h1>
  <textarea bind:value={inputText} placeholder="Enter your text here" />
  <button on:click={analyzeAndSave}>Analyze and Save</button>

  <br />
  <br />
  <h2>Analysis Results</h2>
  <button on:click={() => (showResults = !showResults)}>
    {showResults ? "Hide Results" : "Show Results"}
  </button>

  {#if showResults}
    <div id="results-container">
      <!-- content of results container -->
    </div>
  {/if}
  <details>
    <summary>Bar Chart</summary>
    <div class="plot-container">
      <div id="bar-chart" />
    </div>
  </details>

  <details>
    <summary>Pie Chart</summary>
    <div class="plot-container">
      <div id="pie-chart" />
    </div>
  </details>

  <details>
    <summary>Scatter Plot</summary>
    <div class="plot-container">
      <div id="scatter-plot" />
    </div>
  </details>

  <details>
    <summary>3D Bar Chart</summary>
    <div class="plot-container">
      <div id="bar-chart-3d"></div>
    </div>
  </details>
  
  <details>
    <summary>3D Scatter Plot</summary>
    <div class="plot-container">
      <div id="scatter-plot-3d"></div>
    </div>
  </details>

  <details>
    <summary>3D Axes Diagram</summary>
    <div class="plot-container">
      <div id="axes-3d"></div>
    </div>
  </details>
  <details>
    <summary>3D Surface Plot</summary>
    <div class="plot-container">
      <div id="surface-plot-3d"></div>
    </div>
  </details>
  

  
 
  <div class="bottommargin"></div>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 100%;
    margin: 0 auto;
  }

  textarea {
    width: 100%;
    height: 100px;
  }

  button {
    margin-top: 1em;
  }
  .plot-container {
    height: 100%;
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #bar-chart,
  #pie-chart,
  #scatter-plot,
  #axes-3d {
    height: 100%;
    width: 100%;
    max-width: 100%;
    max-height: 1200px; /* You can adjust this value to limit the maximum height */
  }

  .bottommargin{
    margin-bottom: 200px;
  }
</style>
