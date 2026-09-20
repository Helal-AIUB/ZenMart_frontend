
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const analyticsDataClient = new BetaAnalyticsDataClient();
const propertyId = process.env.GA4_PROPERTY_ID;

export async function getPageViews(pagePath?: string) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo', 
          endDate: 'today',
        },
      ],
      dimensions: pagePath ? [{ name: 'pagePath' }] : [],
      metrics: [
        {
          name: 'screenPageViews', 
        },
      ],
      ...(pagePath && {
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'EXACT',
              value: pagePath,
            },
          },
        },
      }),
    });

    let totalViews = 0;
    if (response.rows && response.rows.length > 0) {
      if (pagePath) {
        totalViews = parseInt(response.rows[0].metricValues?.[0]?.value || '0', 10);
      } else {
        totalViews = response.rows.reduce(
          (acc, row) => acc + parseInt(row.metricValues?.[0]?.value || '0', 10),
          0
        );
      }
    }

    return totalViews;
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    return 0;
  }
}