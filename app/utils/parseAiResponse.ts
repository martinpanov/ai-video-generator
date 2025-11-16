export function parseAiResponse(response: any) {
  // Extract JSON from markdown code block
  const match = response[1]?.text?.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = match && match[1];

  // Parse the JSON
  return JSON.parse(jsonString);
}