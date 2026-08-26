export default async function handler(req, res) {
  try {
    const { endpoint = 'top-headlines', category, q, lang = 'en' } = req.query
    const apiKey = process.env.GNEWS_API_KEY

    // Debug logging
    console.log('API Route called with:', { endpoint, category, q, lang })
    console.log('API Key exists:', !!apiKey)

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'GNEWS_API_KEY environment variable not set on Vercel',
        details: 'Please add GNEWS_API_KEY to Vercel Environment Variables'
      })
    }

    let url = `https://gnews.io/api/v4/${endpoint}?lang=${lang}&apikey=${apiKey}`

    if (category) {
      url += `&category=${category}`
    }
    if (q) {
      url += `&q=${encodeURIComponent(q)}`
    }

    console.log('Fetching from gnews.io with endpoint:', endpoint)

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('gnews.io error:', response.status, errorText)
      throw new Error(`gnews.io API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('News API route error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch news', 
      details: error.message,
      message: error.toString()
    })
  }
}
