export function parseAiResponse(response: any) {
  // Filter out thinking blocks and find the text content
  const textBlock = response.find((block: any) => block.type === 'text');

  if (!textBlock?.text) {
    throw new Error('No text content found in AI response');
  }

  // Try to extract JSON from code fences, otherwise use raw text
  const match = textBlock.text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonString = match ? match[1] : textBlock.text;

  return JSON.parse(jsonString.trim());
}