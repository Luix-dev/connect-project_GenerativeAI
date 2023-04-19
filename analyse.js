import OpenAI from 'openai';

const API_KEY = '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';

OpenAI.apiKey = API_KEY;

export async function post(req, res) {
  const { inputText } = req.body;

  try {
    const prompt = `Create the 5 most important tags about this text: ${inputText}`;
    const response = await OpenAI.Completion.create({
      engine: 'davinci-codex',
      prompt,
      max_tokens: 60,
      n: 1,
      stop: null,
      temperature: 0.5,
    });

    const result = response.choices[0].text.trim();
    const tags = result.split(',').map((tag) => tag.trim());

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ tags }));
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'An error occurred while processing your request' }));
  }
}
