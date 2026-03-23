import { useEffect, useState } from "react";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const token = localStorage.getItem("token");

  const currentUser = (() => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.username;
    } catch {
      return null;
    }
  })();

  /* Load posts */
  useEffect(() => {
    if (!token) return;

    fetch("/api/posts", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setPosts(data));
  }, [token]);

  /* Create post */
  const createPost = async () => {
    if (!content.trim()) return;

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });

    const newPost = await res.json();

    if (!res.ok) return alert(newPost.error);

    setPosts([newPost, ...posts]);
    setContent("");
  };

  /* Delete */
  const deletePost = async (id) => {
    const res = await fetch(`/api/posts/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error);

    setPosts(posts.filter(p => p.id !== id));
  };

  /* Like */
  const likePost = async (id) => {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const updated = await res.json();
    if (!res.ok) return alert(updated.error);

    setPosts(posts.map(p => p.id === id ? updated : p));
  };

  /* Reply */
  const replyPost = async (id, text) => {
    const res = await fetch(`/api/posts/${id}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ text })
    });

    const updated = await res.json();
    if (!res.ok) return alert(updated.error);

    setPosts(posts.map(p => p.id === id ? updated : p));
  };
  
  const openInMobile = async (id) => {
    await fetch("/api/open-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        url: `chatterbox://post/${id}`
      })
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.title}>Feed</h2>

        <div style={styles.createBox}>
          <textarea
            placeholder="What's happening?"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={styles.textarea}
          />
          <button style={styles.primaryBtn} onClick={createPost}>
            Post
          </button>
        </div>

        {posts.map(post => (
          <div key={post.id} style={styles.card}>
            <div style={styles.header}>
              <span style={styles.author}>@{post.author}</span>
              <span style={styles.date}>{post.createdAt}</span>
            </div>

            <p style={styles.content}>{post.content}</p>

            <div style={styles.actions}>
              <button
                style={styles.likeBtn}
                onClick={() => likePost(post.id)}
              >
                ❤️ {post.likes}
              </button>

              <button
                style={styles.mobileBtn}
                onClick={() => openInMobile(post.id)}
              >
                📱 Open in Mobile
              </button>

              {post.author === currentUser && (
                <button
                  style={styles.deleteBtn}
                  onClick={() => deletePost(post.id)}
                >
                  🗑 Delete
                </button>
              )}
            </div>

            <ReplyBox post={post} replyPost={replyPost} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= Reply ================= */

function ReplyBox({ post, replyPost }) {
  const [text, setText] = useState("");

  return (
    <div style={{ marginTop: "15px" }}>
      <div style={styles.replyRow}>
        <input
          placeholder="Reply..."
          value={text}
          onChange={e => setText(e.target.value)}
          style={styles.replyInput}
        />
        <button
          style={styles.replyBtn}
          onClick={() => {
            if (!text.trim()) return;
            replyPost(post.id, text);
            setText("");
          }}
        >
          Reply
        </button>
      </div>

      {post.replies.map(r => (
        <div key={r.id} style={styles.replyItem}>
          ↳ <strong>@{r.author}</strong>: {r.text}
        </div>
      ))}
    </div>
  );
}

/* ================= Styles ================= */

const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    padding: "40px 20px"
  },

  container: {
    maxWidth: "700px",
    margin: "0 auto"
  },

  title: {
    color: "white",
    marginBottom: "25px"
  },

  createBox: {
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(12px)",
    padding: "20px",
    borderRadius: "18px",
    marginBottom: "25px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.4)"
  },

  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    resize: "none",
    marginBottom: "12px"
  },

  primaryBtn: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    cursor: "pointer"
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "20px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    color: "white"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },

  author: {
    color: "#3b82f6",
    fontWeight: 600
  },

  date: {
    fontSize: "12px",
    opacity: 0.6
  },

  content: {
    color: "#e2e8f0",
    marginBottom: "15px"
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px"
  },

  likeBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    cursor: "pointer"
  },

  mobileBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    cursor: "pointer"
  },

  deleteBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    cursor: "pointer"
  },

  replyRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },

  replyInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "8px",
    border: "none"
  },

  replyBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "white"
  },

  replyItem: {
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "4px"
  }
};
