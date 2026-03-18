import { TARGET_CAMPUSES } from './catalog'

export type PlannerCohort = 'transfer' | 'freshman'
export type CampusSegment = (typeof TARGET_CAMPUSES)[number]['segment']

export interface OfficialResource {
  label: string
  url: string
  note: string
}

export interface OfficialRequirementSummary {
  title: string
  detail: string
}

const OFFICIAL_URLS = {
  assist: 'https://assist.org/',
  assistInfo: 'https://resource.assist.org/About/General-Information',
  ucFirstYearRequirements: 'https://admission.universityofcalifornia.edu/admission-requirements/first-year-requirements/',
  ucComprehensiveReview: 'https://admission.universityofcalifornia.edu/how-to-apply/applying-as-a-first-year/how-applications-are-reviewed.html',
  ucFirstYearAdmitData: 'https://admission.universityofcalifornia.edu/campuses-majors/first-year-admit-data.html',
  csuFreshmanRequirements: 'https://www.calstate.edu/apply/freshman/getting_into_the_csu/pages/admission-requirements.aspx',
  csuImpaction: 'https://www.calstate.edu/attend/impaction-at-the-csu'
} as const

const focusSignals: Record<string, { coursework: string; activities: string }> = {
  Engineering: {
    coursework: 'advanced math, lab science, and a senior schedule that stays quantitative',
    activities: 'engineering design, robotics, build projects, or technical team leadership'
  },
  'Computer Science': {
    coursework: 'advanced math plus programming or college-level technical coursework when available',
    activities: 'software projects, hackathons, research, or coding leadership with real output'
  },
  'Biological Sciences': {
    coursework: 'a strong biology and chemistry path with rigorous science progression',
    activities: 'research, health volunteering, science competitions, or sustained STEM service'
  },
  'Physical Sciences': {
    coursework: 'higher-level math with physics or chemistry depth',
    activities: 'lab work, Olympiad-style competitions, science fairs, or research projects'
  },
  Business: {
    coursework: 'quantitative preparation, writing strength, and economics or statistics where available',
    activities: 'leadership, entrepreneurship, finance, community organizing, or work experience'
  },
  Economics: {
    coursework: 'strong math, statistics, and analytical writing',
    activities: 'debate, policy work, research, finance clubs, or data-driven projects'
  },
  Psychology: {
    coursework: 'solid writing, statistics, and a balanced social science record',
    activities: 'research, peer support, service, or leadership tied to people and community'
  },
  'Social Sciences': {
    coursework: 'advanced writing, history or government, and at least one quantitative course',
    activities: 'debate, journalism, public service, research, or community leadership'
  },
  'Data Science': {
    coursework: 'calculus, statistics, programming, and evidence of quantitative depth',
    activities: 'analytics projects, hackathons, research, or open-source work'
  },
  'Public Health': {
    coursework: 'science plus statistics with clear academic preparation for health systems',
    activities: 'health outreach, volunteering, research, or community-based service'
  },
  'Political Science': {
    coursework: 'strong writing, history or government, and analytical coursework',
    activities: 'debate, policy clubs, civic work, journalism, or advocacy'
  },
  Humanities: {
    coursework: 'advanced writing, language, and reading-intensive classes beyond the minimum',
    activities: 'publication, debate, arts, service, or research with a clear voice'
  },
  'Arts and Media': {
    coursework: 'writing or creative production plus any relevant studio, design, or media classes',
    activities: 'portfolio work, productions, student media, or competitions with visible output'
  },
  Mathematics: {
    coursework: 'the highest math sequence available with strong grades',
    activities: 'math teams, tutoring, modeling, or research-style problem solving'
  },
  Nursing: {
    coursework: 'strong biology, chemistry, and quantitative preparation',
    activities: 'clinical volunteering, health service, peer care roles, or sustained community work'
  },
  Education: {
    coursework: 'writing, social science, and developmental or communication-oriented study',
    activities: 'tutoring, mentoring, youth programs, or leadership in education settings'
  },
  Architecture: {
    coursework: 'math, design-oriented courses, and project-based rigor',
    activities: 'portfolio-building, design projects, studio work, or competitions'
  }
}

function formatRange(low: number | null, high: number | null) {
  if (low == null || high == null) return null
  return `${low.toFixed(2)}-${high.toFixed(2)}`
}

export function getCampusEntry(campus: string) {
  return TARGET_CAMPUSES.find((entry) => entry.name === campus)
}

export function getCampusSegment(campus: string): CampusSegment | null {
  return getCampusEntry(campus)?.segment ?? null
}

export function getOfficialResources(campus: string, cohort: PlannerCohort): OfficialResource[] {
  const entry = getCampusEntry(campus)
  const campusDataResource: OfficialResource | null = entry
    ? {
        label: `${campus} data source`,
        url: entry.sourceBase,
        note: 'Campus or system-level data source already referenced by the app.'
      }
    : null

  if (cohort === 'transfer') {
    return [
      {
        label: 'ASSIST',
        url: OFFICIAL_URLS.assist,
        note: 'Official California articulation lookup for transfer planning.'
      },
      {
        label: 'ASSIST overview',
        url: OFFICIAL_URLS.assistInfo,
        note: 'Explains what ASSIST covers and why it is the source of record for articulation.'
      },
      ...(campusDataResource ? [campusDataResource] : [])
    ]
  }

  if (entry?.segment === 'UC') {
    return [
      {
        label: 'UC first-year requirements',
        url: OFFICIAL_URLS.ucFirstYearRequirements,
        note: 'Official A-G, GPA, and freshman eligibility requirements.'
      },
      {
        label: 'UC application review',
        url: OFFICIAL_URLS.ucComprehensiveReview,
        note: 'Official comprehensive review factors used by UC campuses.'
      },
      {
        label: 'UC first-year admit data',
        url: OFFICIAL_URLS.ucFirstYearAdmitData,
        note: 'Official campus and major admit-rate and GPA context.'
      },
      ...(campusDataResource ? [campusDataResource] : [])
    ]
  }

  if (entry?.segment === 'CSU') {
    return [
      {
        label: 'CSU freshman requirements',
        url: OFFICIAL_URLS.csuFreshmanRequirements,
        note: 'Official CSU freshman admission requirements and GPA guidance.'
      },
      {
        label: 'CSU impaction',
        url: OFFICIAL_URLS.csuImpaction,
        note: 'Official campus and major impaction guidance for selective CSU paths.'
      },
      ...(campusDataResource ? [campusDataResource] : [])
    ]
  }

  return [
    ...(campusDataResource
      ? [
          {
            label: `${campus} admissions source`,
            url: campusDataResource.url,
            note: 'Private universities vary more by campus, major, and application component.'
          }
        ]
      : []),
    {
      label: 'Model note',
      url: OFFICIAL_URLS.ucFirstYearAdmitData,
      note: 'Use historical admit data as directional only and verify campus-specific requirements directly.'
    }
  ]
}

export function getOfficialRequirementSummaries(input: {
  campus: string
  cohort: PlannerCohort
  focus: string
}): OfficialRequirementSummary[] {
  const segment = getCampusSegment(input.campus)

  if (input.cohort === 'transfer') {
    return [
      {
        title: 'ASSIST articulation check',
        detail: `Use ASSIST before trusting any transfer plan for ${input.focus}. The model student has lower-division major prep and general education mapped before the filing term.`
      },
      {
        title: 'Major prep before application',
        detail: `For ${input.campus}, treat missing ${input.focus} prerequisites as a real risk. Competitive transfer applicants usually do not leave core math, writing, or lab sequences to the final term.`
      },
      {
        title: 'Campus-specific screening',
        detail:
          segment === 'CSU'
            ? 'If the campus or major is impacted, expect extra screening beyond minimum transfer eligibility.'
            : segment === 'UC'
              ? 'Campus and major review can vary, so use ASSIST plus the destination campus guidance instead of assuming a single statewide standard.'
              : 'Private and non-system schools may publish their own transfer rules, so confirm the destination campus requirements directly.'
      }
    ]
  }

  if (segment === 'UC') {
    return [
      {
        title: 'UC first-year baseline',
        detail: 'Finish the 15 A-G courses, complete at least 11 by the end of junior year, and keep every required course at C or better.'
      },
      {
        title: 'Comprehensive review matters',
        detail: `For ${input.campus}, the model freshman is not just eligible. They usually go beyond the minimum with stronger rigor, a serious senior-year schedule, and field-relevant depth for ${input.focus}.`
      },
      {
        title: 'Major-level competition',
        detail: 'Use campus and major admit data as a directional benchmark because selectivity can move materially by major even inside the same university.'
      }
    ]
  }

  if (segment === 'CSU') {
    return [
      {
        title: 'CSU first-year baseline',
        detail: 'Complete the CSU A-G pattern and keep the CSU GPA strong enough for the campuses you are targeting.'
      },
      {
        title: 'Impaction changes the bar',
        detail: `If ${input.campus} or ${input.focus} is impacted, treat it as a separate admissions market with a higher practical bar than the minimum CSU floor.`
      },
      {
        title: 'Plan for clean execution',
        detail: 'The model freshman usually has no avoidable gaps in A-G completion, no weak senior-year schedule, and a backup list in case the impacted path tightens.'
      }
    ]
  }

  return [
    {
      title: 'Private-campus variation',
      detail: `For ${input.campus}, verify the exact application components for ${input.focus}, because essays, recommendations, portfolios, and testing expectations can differ by institution.`
    },
    {
      title: 'Academic floor plus differentiation',
      detail: 'A strong private-school applicant usually clears the academic bar and also brings a clearer personal, creative, research, or leadership signal.'
    },
    {
      title: 'Major-specific extras',
      detail: 'If the intended program expects a portfolio, audition, resume, or supplemental form, treat that as part of the admissions profile rather than an optional extra.'
    }
  ]
}

export function getModelStudentProfile(input: {
  campus: string
  cohort: PlannerCohort
  focus: string
  sourceSchool?: string
  admitRate: number | null
  gpaP25: number | null
  gpaP50: number | null
  gpaP75: number | null
}) {
  const segment = getCampusSegment(input.campus)
  const range = formatRange(input.gpaP25, input.gpaP75)
  const focusSignal = focusSignals[input.focus] ?? {
    coursework: `clear academic preparation for ${input.focus}`,
    activities: `sustained work that makes the interest in ${input.focus} credible`
  }

  const selectivityLine =
    input.admitRate == null
      ? 'Historical admit-rate data is limited here, so this profile should be treated as directional rather than predictive.'
      : input.admitRate < 15
        ? `This path is operating like a high-selectivity market at about ${input.admitRate.toFixed(1)}% admit rate, so the model student usually looks closer to the top of the pool than the minimum bar.`
        : input.admitRate < 35
          ? `This path is still competitive at about ${input.admitRate.toFixed(1)}% admit rate, so the model student usually looks stronger than merely eligible.`
          : `This path is more attainable at about ${input.admitRate.toFixed(1)}% admit rate, but the model student still avoids visible academic or planning gaps.`

  const gpaLine =
    range && input.gpaP50 != null
      ? `The visible admit band is around ${range}, with the middle near ${input.gpaP50.toFixed(2)}. A more typical admit profile usually lands at or above the middle while keeping the rest of the file clean.`
      : 'Use the loaded admit data as a benchmark, but do not treat any single GPA as a guaranteed threshold.'

  const cohortLine =
    input.cohort === 'transfer'
      ? `For ${input.focus}, the model transfer student usually has ASSIST-backed major prep substantially finished before application review, not just general intent to take those courses later.`
      : segment === 'UC'
        ? `For ${input.campus}, the model freshman usually exceeds the minimum A-G floor with stronger-than-required rigor and a senior-year program that still advances ${input.focus}.`
        : segment === 'CSU'
          ? `For ${input.campus}, the model freshman usually has a clean A-G record and plans around impaction if ${input.focus} is crowded at the campus or major level.`
          : `For ${input.campus}, the model freshman usually combines strong academics with any campus-specific essays, portfolio pieces, or recommendations required for ${input.focus}.`

  const focusLine = `In ${input.focus}, stronger applicants usually show ${focusSignal.coursework}, plus ${focusSignal.activities}.`

  const sourceSchoolLine = input.sourceSchool
    ? `Coming from ${input.sourceSchool}, the differentiator is still the student's own rigor, execution, and field-specific signal rather than the school name by itself.`
    : 'Without a selected source school, treat this as a campus-and-major pattern rather than a promise for any individual high school pipeline.'

  return [selectivityLine, gpaLine, cohortLine, focusLine, sourceSchoolLine]
}
