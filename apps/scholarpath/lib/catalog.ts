export interface CampusCatalogEntry {
  name: string
  segment: 'UC' | 'CSU' | 'Private' | 'CommunityCollege'
  sourceBase: string
  offset: number
}

export interface SourceSchoolCatalogEntry {
  name: string
  school_type: 'HighSchool' | 'CommunityCollege'
  city: string
  state: string
}

export const TRANSFER_MAJORS = [
  'Mathematics',
  'Computer Science',
  'Biology',
  'Business Administration',
  'Economics',
  'Psychology',
  'Mechanical Engineering',
  'Nursing'
] as const

export const FRESHMAN_DISCIPLINES = [
  'Engineering',
  'Computer Science',
  'Biological Sciences',
  'Physical Sciences',
  'Business',
  'Economics',
  'Psychology',
  'Social Sciences'
] as const

export const TARGET_CAMPUSES: CampusCatalogEntry[] = [
  { name: 'UC Berkeley', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 0 },
  { name: 'UC Davis', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 1 },
  { name: 'UC Irvine', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 2 },
  { name: 'UCLA', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 3 },
  { name: 'UC Merced', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 4 },
  { name: 'UC Riverside', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 5 },
  { name: 'UC San Diego', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 6 },
  { name: 'UC Santa Barbara', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 7 },
  { name: 'UC Santa Cruz', segment: 'UC', sourceBase: 'https://www.universityofcalifornia.edu/infocenter', offset: 8 },
  { name: 'Cal Poly San Luis Obispo', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 9 },
  { name: 'San Diego State University', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 10 },
  { name: 'San Jose State University', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 11 },
  { name: 'Cal State Long Beach', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 12 },
  { name: 'Cal State Fullerton', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 13 },
  { name: 'Cal Poly Pomona', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 14 },
  { name: 'San Francisco State University', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 15 },
  { name: 'Cal State Northridge', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 16 },
  { name: 'Sacramento State', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 17 },
  { name: 'Cal State LA', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 18 },
  { name: 'Cal State San Bernardino', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 19 },
  { name: 'Cal State San Marcos', segment: 'CSU', sourceBase: 'https://www.calstate.edu/data-center', offset: 20 },
  { name: 'Stanford University', segment: 'Private', sourceBase: 'https://facts.stanford.edu', offset: 21 },
  { name: 'University of Southern California', segment: 'Private', sourceBase: 'https://oir.usc.edu', offset: 22 },
  { name: 'Santa Clara University', segment: 'Private', sourceBase: 'https://www.scu.edu', offset: 23 },
  { name: 'Chapman University', segment: 'Private', sourceBase: 'https://www.chapman.edu', offset: 24 },
  { name: 'Pepperdine University', segment: 'Private', sourceBase: 'https://www.pepperdine.edu', offset: 25 },
  { name: 'Loyola Marymount University', segment: 'Private', sourceBase: 'https://www.lmu.edu', offset: 26 },
  { name: 'University of San Diego', segment: 'Private', sourceBase: 'https://www.sandiego.edu', offset: 27 },
  { name: 'University of the Pacific', segment: 'Private', sourceBase: 'https://www.pacific.edu', offset: 28 },
  { name: 'Mt. San Antonio College', segment: 'CommunityCollege', sourceBase: 'https://www.mtsac.edu', offset: 29 },
  { name: 'Santa Monica College', segment: 'CommunityCollege', sourceBase: 'https://www.smc.edu', offset: 30 },
  { name: 'De Anza College', segment: 'CommunityCollege', sourceBase: 'https://www.deanza.edu', offset: 31 },
  { name: 'Pasadena City College', segment: 'CommunityCollege', sourceBase: 'https://pasadena.edu', offset: 32 },
  { name: 'Orange Coast College', segment: 'CommunityCollege', sourceBase: 'https://orangecoastcollege.edu', offset: 33 },
  { name: 'El Camino College', segment: 'CommunityCollege', sourceBase: 'https://www.elcamino.edu', offset: 34 }
]

export const HIGH_SCHOOLS = [
  'Walnut High School',
  'Arcadia High School',
  'Irvine High School',
  'Lowell High School',
  'Troy High School',
  'Mission San Jose High School',
  'Torrey Pines High School',
  'Palo Alto High School'
] as const

export const COMMUNITY_COLLEGES = [
  'Mt. San Antonio College',
  'Santa Monica College',
  'Orange Coast College',
  'Pasadena City College',
  'De Anza College',
  'El Camino College',
  'Foothill College',
  'Riverside City College'
] as const

export const SOURCE_SCHOOLS: SourceSchoolCatalogEntry[] = [
  { name: 'Walnut High School', school_type: 'HighSchool', city: 'Walnut', state: 'CA' },
  { name: 'Arcadia High School', school_type: 'HighSchool', city: 'Arcadia', state: 'CA' },
  { name: 'Irvine High School', school_type: 'HighSchool', city: 'Irvine', state: 'CA' },
  { name: 'Lowell High School', school_type: 'HighSchool', city: 'San Francisco', state: 'CA' },
  { name: 'Troy High School', school_type: 'HighSchool', city: 'Fullerton', state: 'CA' },
  { name: 'Mission San Jose High School', school_type: 'HighSchool', city: 'Fremont', state: 'CA' },
  { name: 'Torrey Pines High School', school_type: 'HighSchool', city: 'San Diego', state: 'CA' },
  { name: 'Palo Alto High School', school_type: 'HighSchool', city: 'Palo Alto', state: 'CA' },
  { name: 'Mt. San Antonio College', school_type: 'CommunityCollege', city: 'Walnut', state: 'CA' },
  { name: 'Santa Monica College', school_type: 'CommunityCollege', city: 'Santa Monica', state: 'CA' },
  { name: 'Orange Coast College', school_type: 'CommunityCollege', city: 'Costa Mesa', state: 'CA' },
  { name: 'Pasadena City College', school_type: 'CommunityCollege', city: 'Pasadena', state: 'CA' },
  { name: 'De Anza College', school_type: 'CommunityCollege', city: 'Cupertino', state: 'CA' },
  { name: 'El Camino College', school_type: 'CommunityCollege', city: 'Torrance', state: 'CA' },
  { name: 'Foothill College', school_type: 'CommunityCollege', city: 'Los Altos Hills', state: 'CA' },
  { name: 'Riverside City College', school_type: 'CommunityCollege', city: 'Riverside', state: 'CA' }
]
