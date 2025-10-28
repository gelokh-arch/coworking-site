// netlify/functions/count.js
// Simple function that queries Netlify Forms API for `waitlist` submissions and returns counts.
exports.handler = async function(event, context) {
  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;
  const FORM_ID = 'waitlist'; // matches form-name in index.html
  const totalFounderSlots = Number(process.env.TOTAL_FOUNDER_SLOTS || 300);

  if (!NETLIFY_TOKEN || !SITE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success:false, error: 'Missing NETLIFY_TOKEN or NETLIFY_SITE_ID env variables.' })
    };
  }

  try {
    const url = 'https://api.netlify.com/api/v1/sites/' + SITE_ID + '/forms/' + FORM_ID + '/submissions';
    const res = await fetch(url, {
      headers: { Authorization: 'Bearer ' + NETLIFY_TOKEN }
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error('Netlify API error: ' + res.status + ' ' + txt);
    }
    const submissions = await res.json();
    const signupCount = Array.isArray(submissions) ? submissions.length : 0;
    const remaining = Math.max(0, totalFounderSlots - signupCount);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        signupCount,
        totalFounderSlots,
        remainingFounderSlots: remaining,
        timestamp: new Date().toISOString()
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success:false, error: err.toString() })
    };
  }
};
