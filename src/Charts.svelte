<script>
    import { onMount } from "svelte";
    import * as Plotly from "plotly.js-dist";
  
    export let topics = [];
  
    function createBarChart(data) {
      if(!data) return;
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
        if(!data) return;
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
        if(!data) return;
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
  
      Plotly.newPlot("scatter-plot", [trace], layout);
    }
  
    onMount(() => {
      createBarChart(topics);
      createPieChart(topics);
      createScatterPlot(topics);
    });
  
    $: {
      createBarChart(topics);
      createPieChart(topics);
      createScatterPlot(topics);
    }
  </script>
  