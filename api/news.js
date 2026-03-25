export default async function handler(req, res) {
    const { source = 'the-washington-post' } = req.query;
  
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${process.env.NEWS_API_KEY}`
    );
  
    console.log("API KEY:", process.env.NEWS_API_KEY);
    
    const data = await response.json();
  
    res.status(200).json(data);
  }