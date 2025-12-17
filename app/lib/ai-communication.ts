import { Anthropic } from '@anthropic-ai/sdk';
import { STEPS } from '../constants';
import { FormDataType, StepError } from '../types';

type Params = Pick<FormDataType, "videosAmount" | "videoDuration" | "splitVideo" | "durationType"> & {
  srtData: string;
};

const anthropic = new Anthropic();

export async function aiCommunication({ videosAmount, videoDuration, splitVideo, srtData, durationType }: Params) {
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
      ${!splitVideo &&
        `
        Your expertise includes:
        - Identifying hooks, aha moments, and emotionally resonant segments
        - Understanding narrative arcs and complete thought sequences
        - Recognizing what makes content shareable and engaging for short-form platforms
        - Preserving the authentic voice and complete context of the original content
        - Precise extraction of timecodes from Get Exact Timestamps tool
        `
        }
      CRITICAL: You must use EXACT timecodes from the Get Exact Timestamps tool. Never estimate or calculate time - always extract them directly from the tool.
      
      Your output must be valid JSON only - no explanations, no markdown, no additional text.`,
      messages: [
        {
          "role": "user",
          "content": `Analyze this SRT transcript and extract EXACTLY ${videosAmount} clips (no more, no less). ${!splitVideo && `Each clip must be ${durationType === "Min" ? `no less than ${videoDuration} but at most 5 minutes.` : `at most ${videoDuration}`}`}
          
          **TRANSCRIPT:**
          ${srtData}
          
          **CLIP SELECTION CRITERIA:**
          
          Each clip must:
          ${!splitVideo &&
            `
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
            - Target: ${durationType === "Min" ? `No less than ${videoDuration} but at most 5 minutes` : `At most ${videoDuration}`}
            - Prioritize completeness over brevity
            - If a valuable sequence runs longer, include the full sequence
           `
            }
          **CRITICAL RULES:**
            - You MUST return EXACTLY ${videosAmount} clips - this is non-negotiable
            - Never modify the original transcript text
          ${!splitVideo &&
            `
            - Never cut mid-explanation or mid-story
            - Always include complete context`
            }
            - Preserve the original language
          ${splitVideo &&
            `
            - Break the long video into a series of clips (parts). You must keep the entire video intact—do not remove any content. Simply divide it into multiple parts. 
            - Each part should last at least one minute and should stop just before an important revelation or 'aha' moment.
            - Keep segment lengths balanced across the entire video. Avoid having early segments that are much longer than later ones, or vice versa. For example, don't create several short segments followed by one very long segment, and don't create very long early segments followed by very short ending segments.
            - This structure should entice viewers to continue watching the next parts.
            - The last part's duration doesn't matter that much but ensure it is longer than 30 seconds, we don't want it to be too short.`
            }

          ** OUTPUT FORMAT:**

          Return ONLY valid JSON(no markdown, no explanations):

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
    throw new StepError('Failed to communicate with AI', STEPS.CLIP_VIDEO);
  }
}
