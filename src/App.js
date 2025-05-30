import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const POSTS_PER_PAGE = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch posts with pagination
        const postsRes = await fetch(
          `https://imin.com/wp-json/wp/v2/posts?_embed&per_page=${POSTS_PER_PAGE}&page=${page}`
        );

        if (!postsRes.ok) {
          throw new Error(`Failed to fetch posts: ${postsRes.status}`);
        }

        const postsData = await postsRes.json();
        const totalPagesFromHeader = parseInt(postsRes.headers.get("X-WP-TotalPages"), 10);

        // Fetch categories once
        const categoriesRes = await fetch("https://imin.com/wp-json/wp/v2/categories?per_page=100");
        const categoriesData = await categoriesRes.json();

        const categoriesMap = {};
        categoriesData.forEach((cat) => {
          categoriesMap[cat.id] = cat.name;
        });

        setPosts(postsData);
        setCategories(categoriesMap);
        setTotalPages(totalPagesFromHeader);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [page]);

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  if (loading) return <p className="loading">Loading posts...</p>;
  if (posts.length === 0) return <p className="no-posts">No posts found.</p>;

  return (
    <div className="container">
      <h1 className="title">WordPress Posts</h1>

      {posts.map((post) => {
        const featuredMedia =
          post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

        const postCategories = post.categories
          .map((catId) => categories[catId])
          .filter(Boolean)
          .join(", ");

        const publishedDate = new Date(post.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return (
          <div className="post" key={post.id}>
            <h2 className="post-title">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
            </h2>

            {featuredMedia && (
              <img className="post-image" src={featuredMedia} alt="featured" />
            )}

            <p className="post-date">Published on: {publishedDate}</p>
            <p className="post-categories">
              Categories: <strong>{postCategories || "Uncategorized"}</strong>
            </p>
          </div>
        );
      })}

      <div className="pagination">
        <button onClick={handlePrev} disabled={page === 1}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={handleNext} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
