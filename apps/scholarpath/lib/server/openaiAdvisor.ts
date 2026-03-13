import type { AdvisorRequest, AdvisorResponse } from '@/lib/types'

const advisorSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    competitiveness: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    cautions: { type: 'array', items: { type: 'string' } },
    next_steps: { type: 'array', items: { type: 'string' } },
    coursework_plan: { type: 'array', items: { type: 'string' } },
    extracurricular_plan: { type: 'array', items: { type: 'string' } },
    profile_comparison: { type: 'array', items: { type: 'string' } },
    disclaimer: { type: 'string' }
  },
  required: [
    'summary',
    'competitiveness',
    'strengths',
    'cautions',
    'next_steps',
    'coursework_plan',
    'extracurricular_plan',
    'profile_comparison',
    'disclaimer'
  ],
  additionalProperties: false
} as const

const focusPlaybooks: Record<string, { coursework: string[]; activities: string[] }> = {
  'Computer Science': {
    coursework: ['Data Structures', 'Discrete Math', 'Computer Architecture', 'Calculus II', 'Linear Algebra'],
    activities: ['coding club leadership', 'hackathons', 'software projects', 'research with faculty', 'technical internships']
  },
  Engineering: {
    coursework: ['Calculus II', 'Calculus III', 'Physics with calculus', 'Statics or circuits', 'intro engineering design'],
    activities: ['robotics team', 'engineering competitions', 'maker projects', 'lab assistant work', 'STEM tutoring']
  },
  'Mechanical Engineering': {
    coursework: ['Calculus III', 'Differential Equations', 'Physics mechanics', 'Statics', 'materials or CAD'],
    activities: ['robotics', 'CAD/design portfolio', 'engineering clubs', 'prototype builds', 'manufacturing internships']
  },
  'Electrical Engineering': {
    coursework: ['Calculus III', 'Differential Equations', 'Physics electricity and magnetism', 'circuits', 'programming for engineers'],
    activities: ['electronics projects', 'robotics', 'embedded systems clubs', 'research labs', 'technical competitions']
  },
  'Civil Engineering': {
    coursework: ['Calculus III', 'Physics mechanics', 'Statics', 'materials science', 'CAD or surveying'],
    activities: ['engineering club projects', 'sustainability competitions', 'construction internships', 'community design projects']
  },
  Mathematics: {
    coursework: ['Calculus II', 'Calculus III', 'Linear Algebra', 'Differential Equations', 'proof-based math'],
    activities: ['math club', 'AMC/Putnam prep', 'peer tutoring', 'data or modeling projects']
  },
  Biology: {
    coursework: ['General Biology', 'General Chemistry', 'Organic Chemistry', 'Calculus or Statistics', 'lab sequence'],
    activities: ['research labs', 'hospital volunteering', 'science olympiad', 'public health outreach']
  },
  Chemistry: {
    coursework: ['General Chemistry', 'Organic Chemistry', 'Calculus', 'Physics', 'analytical lab work'],
    activities: ['lab research', 'science clubs', 'STEM tutoring', 'poster presentations']
  },
  Nursing: {
    coursework: ['Anatomy', 'Physiology', 'Microbiology', 'Statistics', 'psychology or communication'],
    activities: ['clinical volunteering', 'health outreach', 'CNA experience', 'peer mentoring']
  },
  'Business Administration': {
    coursework: ['Microeconomics', 'Macroeconomics', 'Calculus or business calculus', 'Statistics', 'Financial Accounting'],
    activities: ['DECA or FBLA', 'entrepreneurship clubs', 'student government', 'internships', 'small business projects']
  },
  Economics: {
    coursework: ['Microeconomics', 'Macroeconomics', 'Calculus II', 'Statistics', 'econometrics prep'],
    activities: ['debate', 'policy clubs', 'research assistant work', 'data analysis projects']
  },
  Psychology: {
    coursework: ['Intro Psychology', 'Statistics', 'Research Methods', 'Biology', 'writing-intensive social science'],
    activities: ['peer counseling', 'research labs', 'community service', 'mental health advocacy']
  },
  Sociology: {
    coursework: ['Intro Sociology', 'Statistics', 'Research Methods', 'writing-intensive humanities/social science'],
    activities: ['community organizing', 'student journalism', 'research projects', 'service leadership']
  },
  'Political Science': {
    coursework: ['US Government', 'Comparative Politics', 'Statistics', 'Economics', 'advanced writing'],
    activities: ['debate', 'mock trial', 'campaign work', 'policy clubs', 'student government']
  },
  History: {
    coursework: ['US History', 'World History', 'advanced writing', 'research seminar', 'politics or humanities electives'],
    activities: ['history day', 'archival projects', 'journalism', 'museum or civic volunteering']
  },
  English: {
    coursework: ['composition', 'literature survey', 'critical theory or advanced writing', 'public speaking'],
    activities: ['school newspaper', 'literary magazine', 'debate', 'writing competitions']
  },
  Communications: {
    coursework: ['public speaking', 'media studies', 'writing', 'statistics', 'digital storytelling'],
    activities: ['student media', 'podcasts', 'marketing clubs', 'event coordination', 'speech and debate']
  },
  'Public Health': {
    coursework: ['Biology', 'Statistics', 'Chemistry', 'Psychology', 'epidemiology-related electives'],
    activities: ['health volunteering', 'community outreach', 'research labs', 'public health campaigns']
  },
  'Data Science': {
    coursework: ['Programming', 'Statistics', 'Linear Algebra', 'Calculus', 'database or machine learning intro'],
    activities: ['data projects', 'hackathons', 'research', 'analytics internships', 'open-source work']
  },
  Humanities: {
    coursework: ['advanced writing', 'history or philosophy seminars', 'foreign language', 'research-heavy electives'],
    activities: ['journalism', 'debate', 'community service leadership', 'museum or arts volunteering']
  },
  'Arts and Media': {
    coursework: ['studio or media production', 'design or film analysis', 'digital tools', 'writing'],
    activities: ['portfolio projects', 'school productions', 'student media', 'arts organizations', 'competitions']
  }
}

function buildFocusGuidance(focus: string) {
  const guidance = focusPlaybooks[focus]
  if (guidance) {
    return guidance
  }

  return {
    coursework: ['strong math or writing foundation', 'core major prerequisites', 'research or project-based coursework'],
    activities: ['leadership roles', 'service tied to the field', 'hands-on projects', 'relevant internships or competitions']
  }
}

function extractTextOutput(payload: any): string {
  if (typeof payload.output_text === 'string' && payload.output_text.length > 0) {
    return payload.output_text
  }

  const maybeText = payload.output
    ?.flatMap((item: any) => item.content ?? [])
    ?.find((content: any) => typeof content.text === 'string')

  if (typeof maybeText?.text === 'string') {
    return maybeText.text
  }

  throw new Error('OpenAI response did not include text output')
}

export async function generateAdvisorResponse(request: AdvisorRequest): Promise<AdvisorResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5'
  const focusGuidance = buildFocusGuidance(request.focus)
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            'You are a college planning analyst. Use the supplied metrics and student profile. Do not invent institution-specific requirements that are not stated, but you may give common-sense planning guidance for transfer prerequisites, AP rigor, GPA targets, and extracurricular positioning. Be practical, specific, and comparative.'
        },
        {
          role: 'user',
          content: [
            `Campus: ${request.campus}`,
            `Cohort: ${request.cohort}`,
            `Focus: ${request.focus}`,
            `Source school: ${request.sourceSchool ?? 'n/a'}`,
            `School type: ${request.schoolType ?? 'n/a'}`,
            `Years: ${request.years.join(', ')}`,
            `Current GPA: ${request.currentGpa ?? 'unknown'}`,
            `Target GPA: ${request.targetGpa ?? 'unknown'}`,
            `AP count: ${request.apCount ?? 'unknown'}`,
            `Extracurricular strength: ${request.extracurricularStrength ?? 'unknown'}`,
            `Transfer requirement progress: ${request.transferRequirementProgress ?? 'unknown'}`,
            `Major preparation progress: ${request.majorPreparationProgress ?? 'unknown'}`,
            `Planned courses: ${(request.plannedCourses ?? []).join(', ') || 'none provided'}`,
            `Target activities: ${(request.targetActivities ?? []).join(', ') || 'none provided'}`,
            `Suggested coursework patterns for ${request.focus}: ${focusGuidance.coursework.join(', ')}`,
            `Suggested activity patterns for ${request.focus}: ${focusGuidance.activities.join(', ')}`,
            'Available metrics JSON:',
            JSON.stringify(
              request.metrics.map((metric) => ({
                stat_name: metric.stat_name,
                value: metric.stat_value_numeric ?? metric.stat_value_text ?? null,
                unit: metric.unit,
                year: metric.year,
                term: metric.term
              }))
            ),
            'Return a detailed applicant-facing interpretation.',
            'For transfers, emphasize transfer admission requirements, major prerequisites, and course sequencing.',
            'For freshmen, emphasize GPA rigor, AP/advanced coursework, and extracurricular profile.',
            'For both, explain what kind of student profile is more competitive relative to the visible metrics, suggest concrete classes to prioritize, and suggest concrete activities, events, projects, leadership, or service that strengthen the profile.',
            'Make the output richer than generic admissions advice.',
            'Array length targets:',
            '- strengths: 3 to 5 items',
            '- cautions: 3 to 5 items',
            '- next_steps: 4 to 6 items',
            '- coursework_plan: 5 to 8 concrete course or sequencing suggestions',
            '- extracurricular_plan: 4 to 6 concrete activity, leadership, project, competition, internship, or volunteering suggestions',
            '- profile_comparison: 4 to 6 comparisons describing what more competitive applicants usually look like versus less competitive ones',
            'If institution-specific requirements are not in the metrics, explicitly say to verify official articulation or admissions pages, but still provide a plausible course and activity plan based on the focus and cohort.',
            'Mention uncertainty when the evidence is synthetic or not major-specific.'
          ].join('\n')
        }
      ],
      reasoning: { effort: 'medium' },
      text: {
        format: {
          type: 'json_schema',
          name: 'scholar_advisor',
          strict: true,
          schema: advisorSchema
        }
      }
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`OpenAI API error ${response.status}: ${detail}`)
  }

  const payload = await response.json()
  return JSON.parse(extractTextOutput(payload)) as AdvisorResponse
}
