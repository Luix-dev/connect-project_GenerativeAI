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

  let inputText = "";
  let notes = [];
  let currentPage = "input";

  const configuration = new Configuration({
    apiKey: "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",
  });

  const openai = new OpenAIApi(configuration);

  async function analyseAndSave() {
    try {
      if (inputText.trim() === "") return;

      // Get all unique tags from notes
      const uniqueTags = new Set();
      notes.forEach((note) => {
        note.output.split(",").forEach((tag) => {
          uniqueTags.add(tag.trim());
        });
      });

      const currentTags = Array.from(uniqueTags).join(", ");
      console.log(uniqueTags);

      const prompt = `Create Tags that describe the text after the ":". 
						Just write the words that are comma-separated. Try to use the same Tags if possible, here are the current Tags: ${currentTags}. Don't list them, just write 
						them separated by comma, don't write anything besides the tags: ${inputText}`;

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const prompt2 = `Create a title for the following text: ${inputText} \n just give me a plain text answer, a very simple title, maximum 5 words`;

      const response2 = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt2 }],
      });

	  console.log(response2);
	  const title = response2.data.choices[0].message.content.trim();
      const responseParts = response.data.choices[0].message.content.split(",");
      const tags = responseParts.join(",").trim();

      console.log("Title:", title);
      console.log("Tags:", tags);

      notes.push({ text: inputText, title, output: tags });
      updateVisualization();

      inputText = "";
    } catch (error) {
      console.error("Error in analyseAndSave function:", error);
    }
  }

  function updateVisualization() {
    const svg = select("#visualization");
    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const nodesMap = new Map();
    notes.forEach((note) => {
      nodesMap.set(note.title, { id: note.title });
      note.output.split(",").forEach((tag) => {
        const trimmedTag = tag.trim();
        if (!nodesMap.has(trimmedTag)) {
          nodesMap.set(trimmedTag, { id: trimmedTag });
        }
      });
    });

    const nodes = notes.map((note) => ({ id: note.title, tags: note.output }));

    const links = [];
    for (let i = 0; i < notes.length; i++) {
      const noteA = notes[i];
      const tagsA = new Set(noteA.output.split(",").map((tag) => tag.trim()));

      for (let j = i + 1; j < notes.length; j++) {
        const noteB = notes[j];
        const tagsB = new Set(noteB.output.split(",").map((tag) => tag.trim()));

        const sharedTags = new Set([...tagsA].filter((tag) => tagsB.has(tag)));

        if (sharedTags.size > 0) {
          links.push({
            source: nodes[i],
            target: nodes[j],
            sharedTags: Array.from(sharedTags),
          });
        }
      }
    }

    const simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(links).id((d) => d.id)
      )
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(width / 2, height / 2));

    const node = svg
      .selectAll(".node")
      .data(nodes, (d) => d.id)
      .join("circle")
      .attr("class", "node")
      .attr("r", 20) // Increase radius
      .style("fill", "#69b3a2");

    node.on("click", (event, d) => {
      const infoContainer = document.getElementById("info-container");
      const infoContent = document.getElementById("info-content");
      const note = notes.find((note) => note.title === d.id);
      infoContent.innerHTML = `
    <strong>Text:</strong> ${note.text}<br>
    <strong>Tags:</strong> ${note.output}
  `;
      infoContainer.classList.remove("hidden");
    });

    const label = svg
      .selectAll(".label")
      .data(nodes, (d) => d.id)
      .join("text")
      .attr("class", "label")
      .text((d) => d.id)
      .style("font-size", "14px") // Increase font size
      .style("fill", "#333");

    const link = svg
      .selectAll(".link")
      .data(links)
      .join("line")
      .attr("class", "link")
      .style("stroke", "#aaa")
      .style("stroke-width", 3); // Increase stroke width

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      label.attr("x", (d) => d.x + 5).attr("y", (d) => d.y - 5);
    });
  }

  onMount(() => {
    const hideInfoBtn = document.getElementById("hide-info-btn");
    hideInfoBtn.addEventListener("click", () => {
      const infoContainer = document.getElementById("info-container");
      infoContainer.classList.add("hidden");
    });
  });

  function updateNotes() {
    const notesContainer = document.getElementById("notes-container");
    notesContainer.innerHTML = "";

    notes.forEach((note) => {
      const noteElem = document.createElement("li");
      noteElem.innerHTML = `
	  	  <strong>${note.title}</strong><br>
		  <strong>Text:</strong> ${note.text}<br>
		  <strong>Tags:</strong> ${note.output}
		`;
      notesContainer.appendChild(noteElem);
    });
  }

  onMount(() => {
    setInterval(() => {
      updateNotes();
    }, 1000);
  });

  function createPlotlyChart() {
  const data = notes.map((note) => ({
    x: note.output.split(",").map((tag) => tag.trim()),
    y: [note.title], // Use note.title instead of note.text
    z: [note.output.split(",").length],
    // ... (existing code)
  }));

  const layout = {
    title: "Notes by Tags",
    scene: {
      xaxis: {
        title: "Tags",
      },
      yaxis: {
        title: "Title", // Change to "Title"
      },
      zaxis: {
        title: "Number of Tags",
      },
    },
    margin: {
      l: 0,
      r: 0,
      b: 0,
      t: 80,
    },
    // Set height and width to fill the screen
    height: window.innerHeight - 120, // Subtract the header height and some padding
    width: window.innerWidth,
  };

  Plotly.newPlot("plotly-visualization", data, layout);
}
</script>

<main>
  <div class="header">
    <button on:click={() => (currentPage = "input")}>Input</button>
    <button on:click={() => (currentPage = "visualization")}>3D.js</button>
    <button
      on:click={() => {
        currentPage = "plotly";
        createPlotlyChart();
      }}>Plotly</button
    >
  </div>

  <div id="content">
    <h1>Digital Knowledge Space</h1>
    <div class="input-section" class:active={currentPage === "input"}>
      <textarea
        bind:value={inputText}
        rows="10"
        cols="50"
        placeholder="Enter your text here..."
      />
      <br />
      <button on:click={analyseAndSave}>Analyse and Save</button>
      <h2>Notes</h2>
      <ul id="notes-container" />
    </div>

    <div
      class="visualization-section"
      class:active={currentPage === "visualization"}
    >
      <svg id="visualization" width="800" height="600" />
    </div>
    <div id="info-container" class="hidden">
      <button id="hide-info-btn">Hide</button>
      <div id="info-content" />
    </div>
    <div class="plotly-section" class:active={currentPage === "plotly"}>
      <div id="plotly-visualization" />
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  .header {
    display: flex;
    justify-content: space-around;
    background-color: #98ddca; /* soft green background */
    padding: 10px 0;
    width: 100%;
  }

  .header button {
    background-color: #25906b; /* dark green background */
    border: none;
    color: white; /* white text */
    cursor: pointer;
    padding: 12px 24px;
    text-decoration: none;
    font-size: 18px;
  }

  .header button:hover {
    background-color: #1d6a52;
  }

  /* rest of the styles */

  #content {
    flex-grow: 1;
    padding: 16px;
  }

  .input-section,
  .visualization-section {
    display: none;
  }

  .input-section.active,
  .visualization-section.active {
    display: block;
  }

  /* Add the following styles to make the visualization fullscreen */
  .visualization-section {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 90%;
    overflow: auto;
  }

  svg#visualization {
    width: 100%;
    height: 100%;
    margin-top: 50px;
  }

  .visualization-section {
    margin-top: 80px;
  }

  #info-container {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: white;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }

  .hidden {
    display: none;
  }

  .plotly-section {
  display: none;
  height: 100%;
  overflow: auto; /* Add this line to handle overflow */
}

  .plotly-section.active {
    display: block;
    padding: 16px;
  }
</style>
