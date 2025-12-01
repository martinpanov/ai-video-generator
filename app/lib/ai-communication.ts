import { Anthropic } from '@anthropic-ai/sdk';
import { STEPS } from '../constants';

const anthropic = new Anthropic();

export async function aiCommunication(videosAmount: number, videoDuration: string, srt: string) {
  try {
    return await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 10240,
      thinking: {
        budget_tokens: 1024,
        type: "enabled"
      },
      system:
        `You are an expert TikTok and Youtube shorts content strategist specializing in extracting viral-worthy clips from long-form podcast SRT transcripts.
      
      Your expertise includes:
      - Identifying hooks, aha moments, and emotionally resonant segments
      - Understanding narrative arcs and complete thought sequences
      - Recognizing what makes content shareable and engaging for short-form platforms
      - Preserving the authentic voice and complete context of the original content
      - Precise extraction of timecodes from Get Exact Timestamps tool
      
      CRITICAL: You must use EXACT timecodes from the Get Exact Timestamps tool. Never estimate or calculate time - always extract them directly from the tool.
      
      Your output must be valid JSON only - no explanations, no markdown, no additional text.`,
      messages: [
        {
          "role": "user",
          "content": `Analyze this SRT transcript and extract EXACTLY ${videosAmount} clips (no more, no less). Each clip must be less than ${videoDuration}.
          
          **TRANSCRIPT:**
          ${srt}
          
          **CLIP SELECTION CRITERIA:**
          
          Each clip must:
          
          1. **Deliver Complete Value**
          - Full narrative arc with setup, development, and payoff
          - Clear "aha moment" or key revelation
          - All necessary context and supporting points
          
          2. **Be Independently Meaningful**
          - Complete thought sequences (not fragments)
          - Enough context for new viewers to understand
          - No mid-explanation cuts
          
          3. **Have Natural Flows**
          - Start at the beginning of a new thought/topic
          - End after completing the full idea
          - Include logical transitions
          
          4. **Prioritize Viral-Worthy Content:**
          - Strong hooks or surprising statements
          - Emotional resonance or relatability
          - Actionable insights or frameworks
          - Compelling stories with clear conclusions
          - Controversial or counterintuitive takes
          
          **LENGTH GUIDANCE:**
          - Target: Less than ${videoDuration}
          - Prioritize completeness over brevity
          - If a valuable sequence runs longer, include the full sequence
          
          **CRITICAL RULES:**
          - You MUST return EXACTLY ${videosAmount} clips - this is non-negotiable
          - Never modify the original transcript text
          - Never cut mid-explanation or mid-story
          - Always include complete context
          - Preserve the original language
          
          **OUTPUT FORMAT:**
          
          Return ONLY valid JSON (no markdown, no explanations):
          
          [
            {
              "clip": "EXACT_TRANSCRIPT_TEXT_ONLY",
              "description": "4-5 word compelling description",
              "title": "Catchy 8 word title for Youtube",
              "post": "Short powerful social media post",
              "status": "pending",
              "clipUrl": "",
              "timeStart": "HH:MM:SS",
              "timeEnd": "HH:MM:SS"
              }
              ]
              `
        }
      ]
    });
  } catch (error) {
    console.error('Failed to communicate with AI:', error);

    const err = new Error('Failed to communicate with AI');
    (err as any).step = STEPS.CLIP_VIDEO;
    throw err;
  }
}
