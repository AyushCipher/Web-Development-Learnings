# import requests
# from bs4 import BeautifulSoup

# url = "https://www.imdb.com/chart/top/"

# response = requests.get(url)

# soup = BeautifulSoup(response.content, "html.parser")

# print(soup.prettify())  # Print the parsed HTML content in a readable format

from fastapi import FastAPI, HTTPException, Request
import requests
from bs4 import BeautifulSoup
import time

# SlowAPI imports
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI()


# SlowAPI keeps track of how many requests this IP has made.
limiter = Limiter(key_func=get_remote_address)


# Tell FastAPI what to do when the rate limit is exceeded.
app.state.limiter = limiter

# Add the rate limit exceeded handler to the FastAPI app
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# CACHE
cache = {
    "data": None,
    "timestamp": 0
}

@app.get("/")
def home():
    return {"message": "IMDb Scraper API. Visit /top-movies to get rated movies."}

# GET TOP MOVIES
@limiter.limit("5/minute")
@app.get("/top-movies")
def get_top_movies(request: Request,page: int = 1, limit: int = 10):

    # Start measuring this API request
    start_time = time.time()


    # CHECK CACHE
    if (cache["data"] is not None and (time.time() - cache["timestamp"]) < 3600):

        # Data is coming from CACHE
        start_cache = time.time()

        start_index = (page - 1) * limit

        movies = cache["data"][start_index:start_index + limit]

        end_cache = time.time()

        cache_time = end_cache - start_cache
        total_time = time.time() - start_time

        print("================================")
        print("SOURCE: CACHE")
        print(f"Cache created at: {cache['timestamp']}")
        print(f"Cache retrieval time: {cache_time:.6f} seconds")
        print(f"Total API response time: {total_time:.6f} seconds")
        print("================================")

        return {
            "source": "cache",
            "cache_created_at": cache["timestamp"],
            "cache_retrieval_time": f"{cache_time:.6f} seconds",
            "total_response_time": f"{total_time:.6f} seconds",
            "top_movies": movies
        }


    # SCRAPE IMDB
    print("Cache expired/missing. Scraping IMDb...")

    scrape_start = time.time()

    url = "https://www.imdb.com/chart/top/"

    response = requests.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code,detail="Failed to retrieve data")

    soup = BeautifulSoup(response.content,"html.parser")

    # EXTRACT MOVIES
    movies = []

    for row in soup.select("table.chart.full-width tr"):

        title_column = row.select_one("td.titleColumn a")

        if title_column:

            title = title_column.text

            year = row.select_one("td.titleColumn span.secondaryInfo").text.strip("()")

            rating = row.select_one("td.imdbRating strong").text

            movies.append({
                "title": title,
                "year": year,
                "rating": rating
            })


    scrape_end = time.time()

    scrape_time = scrape_end - scrape_start


    # UPDATE CACHE
    cache["data"] = movies

    # Store the exact time when data was scraped/cached
    cache["timestamp"] = time.time()


    # PAGINATION
    start_index = (page - 1) * limit

    movies_to_return = movies[start_index:start_index + limit]


    # Total API time
    total_time = time.time() - start_time


    # PRINT TIMING INFORMATION
    print("================================")
    print("SOURCE: SCRAPED")
    print(f"Scraped at: {cache['timestamp']}")
    print(f"Scraping time: {scrape_time:.6f} seconds")
    print(f"Total API response time: {total_time:.6f} seconds")
    print("================================")


    return {
        "source": "scraped",
        "scraped_at": cache["timestamp"],
        "scraping_time": f"{scrape_time:.6f} seconds",
        "total_response_time": f"{total_time:.6f} seconds",
        "top_movies": movies_to_return
    }

# In this file, we have implemented a FastAPI application that scrapes the top movies from IMDb, applies rate limiting, and caches the results for one hour. The application has the following features:
# 1. A GET endpoint that scrapes the top movies from IMDb and returns them in a paginated format.
# 2. Caching mechanism to store the scraped data for one hour, reducing the need for repeated scraping.
# 3. Rate limiting using SlowAPI to restrict the number of requests to 5 per minute per IP address.