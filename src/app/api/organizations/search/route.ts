import { NextRequest, NextResponse } from 'next/server';

type ProPublicaOrganization = {
  name: string;
  ein: string;
  city: string;
  state: string;
  strein: string; // String version of EIN
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Search query must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Call ProPublica Nonprofit Explorer API
    const proPublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(
      query
    )}`;

    const response = await fetch(proPublicaUrl, {
      headers: {
        'User-Agent': 'Bloomwell-AI/1.0',
      },
    });

    if (!response.ok) {
      console.error('ProPublica API error:', response.statusText);
      return NextResponse.json(
        { error: 'Failed to search organizations' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Transform ProPublica data to our format
    const organizations = (data.organizations || [])
      .slice(0, 10) // Limit to 10 results
      .map((org: ProPublicaOrganization) => ({
        name: org.name || 'Unknown',
        ein: org.strein || org.ein?.toString() || '',
        city: org.city || '',
        state: org.state || '',
      }))
      .filter((org: { ein: string }) => org.ein && org.ein !== ''); // Only include orgs with EIN

    return NextResponse.json({
      organizations,
      count: organizations.length,
    });
  } catch (error) {
    console.error('Organization search error:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching organizations' },
      { status: 500 }
    );
  }
}

