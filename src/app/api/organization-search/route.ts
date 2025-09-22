import { NextRequest, NextResponse } from 'next/server'

// ProPublica Nonprofit Explorer API endpoint
const PROPUBLICA_API_BASE = 'https://projects.propublica.org/nonprofits/api/v2'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const ein = searchParams.get('ein')

    if (!query && !ein) {
      return NextResponse.json(
        { error: 'Query parameter "q" (organization name) or "ein" is required' },
        { status: 400 }
      )
    }

    let apiUrl: string

    if (ein) {
      // Search by EIN
      apiUrl = `${PROPUBLICA_API_BASE}/organizations/${ein}.json`
    } else {
      // Search by organization name
      apiUrl = `${PROPUBLICA_API_BASE}/search.json?q=${encodeURIComponent(query)}`
    }

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Bloomwell-AI/1.0 (https://bloomwell-ai.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ organizations: [] })
      }
      throw new Error(`ProPublica API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to a consistent format
    let organizations = []

    if (ein) {
      // Single organization by EIN
      if (data.organization) {
        organizations = [transformOrganizationData(data.organization)]
      }
    } else {
      // Multiple organizations by name search
      if (data.organizations && Array.isArray(data.organizations)) {
        organizations = data.organizations.map(transformOrganizationData)
      }
    }

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Organization search error:', error)
    return NextResponse.json(
      { error: 'Failed to search organizations' },
      { status: 500 }
    )
  }
}

function transformOrganizationData(org: any) {
  return {
    ein: org.ein,
    name: org.name,
    city: org.city,
    state: org.state,
    zip: org.zip,
    country: org.country || 'US',
    category: org.category,
    subsection: org.subsection,
    ruling_date: org.ruling_date,
    deductibility: org.deductibility,
    classification: org.classification,
    asset_amount: org.asset_amount,
    income_amount: org.income_amount,
    revenue_amount: org.revenue_amount,
    ntee_code: org.ntee_code,
    ntee_classification: org.ntee_classification,
    website: org.website,
    mission: org.mission,
    // Additional useful fields
    address: `${org.street || ''} ${org.city || ''}, ${org.state || ''} ${org.zip || ''}`.trim(),
    full_address: {
      street: org.street,
      city: org.city,
      state: org.state,
      zip: org.zip,
      country: org.country || 'US'
    }
  }
}
