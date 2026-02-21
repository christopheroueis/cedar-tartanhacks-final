/**
 * AI Service
 * Handles AI-powered conversation extraction
 * Supports both Claude (Anthropic) and Groq APIs
 */

import axios from 'axios'

// API Configuration - Claude is primary, Groq is fallback
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-3-haiku-20240307' // Fast and cheap

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'  // Updated to supported model

const EXTRACTION_PROMPT = `You are an AI assistant extracting loan application data from a conversation between a loan officer and a client. Extract the following fields as JSON.

For each field, indicate your confidence level (high/medium/low):
- high: The information was explicitly stated
- medium: The information was implied or you're reasonably certain
- low: You're guessing or the information wasn't mentioned

Return ONLY valid JSON in this exact format:
{
  "data": {
    "clientName": string | null,
    "clientAge": number | null,
    "projectType": "agriculture" | "livestock" | "retail" | "manufacturing" | "services" | "housing" | "fishing" | "transport" | null,
    "cropType": string | null,
    "loanAmount": number | null,
    "loanPurpose": string | null,
    "loanTerm": number | null,
    "loanType": "working-capital" | "equipment-purchase" | "land-acquisition" | "crop-inputs" | "livestock-purchase" | "construction" | null,
    "existingLoans": number | null,
    "repaymentHistory": number | null,
    "monthlyIncome": number | null,
    "collateralType": "land-title" | "savings-deposit" | "equipment" | "livestock" | "group-guarantee" | "none" | null,
    "businessExperience": number | null,
    "landOwnership": "owned" | "leased-long" | "leased-short" | "sharecropping" | null,
    "irrigationAccess": "full" | "partial" | "rain-fed" | null,
    "insuranceStatus": "crop-and-health" | "crop-only" | "health-only" | "none" | null
  },
  "confidence": {
    "clientName": "high" | "medium" | "low",
    "clientAge": "high" | "medium" | "low",
    "projectType": "high" | "medium" | "low",
    "cropType": "high" | "medium" | "low",
    "loanAmount": "high" | "medium" | "low",
    "loanPurpose": "high" | "medium" | "low",
    "loanTerm": "high" | "medium" | "low",
    "loanType": "high" | "medium" | "low",
    "existingLoans": "high" | "medium" | "low",
    "repaymentHistory": "high" | "medium" | "low",
    "monthlyIncome": "high" | "medium" | "low",
    "collateralType": "high" | "medium" | "low",
    "businessExperience": "high" | "medium" | "low",
    "landOwnership": "high" | "medium" | "low",
    "irrigationAccess": "high" | "medium" | "low",
    "insuranceStatus": "high" | "medium" | "low"
  },
  "summary": "Brief summary of what was discussed"
}

If information is unclear or not mentioned, set the value to null and confidence to "low".
Currency amounts should be converted to numbers (e.g., "5000 dollars" → 5000).
Percentage values for repayment history should be 0-100 (e.g., "always paid on time" → 95).

CONVERSATION TRANSCRIPT:
`

/**
 * Extract using Claude API (Anthropic)
 */
async function extractWithClaude(transcript, apiKey) {
    const response = await axios.post(
        CLAUDE_API_URL,
        {
            model: CLAUDE_MODEL,
            max_tokens: 1024,
            messages: [
                {
                    role: 'user',
                    content: EXTRACTION_PROMPT + transcript
                }
            ]
        },
        {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    )

    const content = response.data?.content?.[0]?.text
    if (!content) throw new Error('No response from Claude')

    // Parse JSON from response (Claude might include explanation text)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        console.error('Claude Response (No JSON):', content)
        throw new Error('No JSON found in response')
    }

    return {
        parsed: JSON.parse(jsonMatch[0]),
        usage: response.data?.usage
    }
}

/**
 * Extract using Groq API
 */
async function extractWithGroq(transcript, apiKey) {
    const response = await axios.post(
        GROQ_API_URL,
        {
            model: GROQ_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that extracts structured data from conversations. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: EXTRACTION_PROMPT + transcript
                }
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        },
        {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    )

    const content = response.data?.choices?.[0]?.message?.content
    if (!content) {
        console.error('Groq Response (No Content):', JSON.stringify(response.data, null, 2))
        throw new Error('No response from Groq')
    }

    return {
        parsed: JSON.parse(content),
        usage: response.data?.usage
    }
}

/**
 * Extract structured loan data from conversation transcript
 * Tries Claude first, then Groq as fallback
 */
export async function extractFormData(transcript) {
    const claudeKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
    const groqKey = process.env.GROQ_API_KEY

    if (!claudeKey && !groqKey) {
        // Demo fallback — return realistic mock extraction
        console.log('AI keys not configured, using demo extraction')
        return {
            success: true,
            provider: 'demo',
            extracted: {
                clientName: 'Rahim Ahmed',
                clientAge: 42,
                projectType: 'agriculture',
                cropType: 'rice',
                loanAmount: 3000,
                loanPurpose: 'Purchase seeds and fertilizer for monsoon season rice crop',
                loanTerm: 12,
                loanType: 'crop-inputs',
                existingLoans: 1,
                repaymentHistory: 92,
                monthlyIncome: 450,
                collateralType: 'land-title',
                businessExperience: 15,
                landOwnership: 'owned',
                irrigationAccess: 'partial',
                insuranceStatus: 'none'
            },
            confidence: {
                clientName: 'high',
                clientAge: 'high',
                projectType: 'high',
                cropType: 'high',
                loanAmount: 'high',
                loanPurpose: 'high',
                loanTerm: 'medium',
                loanType: 'medium',
                existingLoans: 'medium',
                repaymentHistory: 'medium',
                monthlyIncome: 'medium',
                collateralType: 'medium',
                businessExperience: 'medium',
                landOwnership: 'high',
                irrigationAccess: 'medium',
                insuranceStatus: 'low'
            },
            summary: '(Demo) Loan officer interview with a rice farmer requesting crop inputs financing.',
            quality: { score: 0.72, level: 'high', fieldsExtracted: 16, totalFields: 16 }
        }
    }

    if (!transcript || transcript.trim().length < 20) {
        return {
            success: false,
            error: 'Transcript too short. Please provide more conversation content.'
        }
    }

    let extracted, provider

    try {
        // Try Claude first if key is available
        if (claudeKey) {
            try {
                const result = await extractWithClaude(transcript, claudeKey)
                extracted = result.parsed
                provider = 'claude'
                console.log('AI extraction via Claude successful')
            } catch (claudeError) {
                console.warn('Claude failed, trying Groq:', claudeError.message)
                if (groqKey) {
                    const result = await extractWithGroq(transcript, groqKey)
                    extracted = result.parsed
                    provider = 'groq'
                } else {
                    throw claudeError
                }
            }
        } else if (groqKey) {
            const result = await extractWithGroq(transcript, groqKey)
            extracted = result.parsed
            provider = 'groq'
        }

        // Calculate quality score
        const confidenceScores = Object.values(extracted.confidence || {})
        const highCount = confidenceScores.filter(c => c === 'high').length
        const mediumCount = confidenceScores.filter(c => c === 'medium').length
        const totalFields = confidenceScores.length || 1
        const qualityScore = ((highCount * 1.0) + (mediumCount * 0.6)) / totalFields

        return {
            success: true,
            provider,
            extracted: extracted.data,
            confidence: extracted.confidence,
            summary: extracted.summary,
            quality: {
                score: parseFloat(qualityScore.toFixed(2)),
                level: qualityScore > 0.7 ? 'high' : qualityScore > 0.4 ? 'medium' : 'low',
                fieldsExtracted: Object.values(extracted.data).filter(v => v !== null).length,
                totalFields
            }
        }

    } catch (error) {
        console.error('AI extraction error:', error.message)
        if (error.response) {
            console.error('API Error Data:', JSON.stringify(error.response.data, null, 2))
        }

        if (error.response?.status === 401) {
            return { success: false, error: 'Invalid API key' }
        }
        if (error.response?.status === 429) {
            return { success: false, error: 'Rate limit exceeded. Please try again.' }
        }

        return {
            success: false,
            error: `Extraction failed: ${error.message}`
        }
    }
}

/**
 * Validate and clean extracted data
 */
export function validateExtractedData(extracted) {
    const validated = { ...extracted }
    const issues = []

    if (validated.clientAge !== null) {
        if (validated.clientAge < 18 || validated.clientAge > 100) {
            issues.push('Age seems invalid')
            validated.clientAge = null
        }
    }

    if (validated.loanAmount !== null) {
        if (validated.loanAmount <= 0 || validated.loanAmount > 10000000) {
            issues.push('Loan amount seems invalid')
        }
    }

    if (validated.repaymentHistory !== null) {
        validated.repaymentHistory = Math.min(100, Math.max(0, validated.repaymentHistory))
    }

    if (validated.loanTerm !== null) {
        if (validated.loanTerm <= 0 || validated.loanTerm > 120) {
            issues.push('Loan term seems invalid')
        }
    }

    return {
        data: validated,
        issues,
        isValid: issues.length === 0
    }
}

export default {
    extractFormData,
    validateExtractedData
}
