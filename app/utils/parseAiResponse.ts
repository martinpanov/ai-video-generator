export function parseAiResponse(response: any) {
  const match = response[1]?.text?.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = match && match[1];

  return JSON.parse(jsonString);
}