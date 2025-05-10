import Link from 'next/link'
import React from 'react'

const PostPage = () => {
  const posts = [
    { id: 1, title: 'Post 1', content: 'Content of Post 1' },
    { id: 2, title: 'Post 2', content: 'Content of Post 2' },
    { id: 3, title: 'Post 3', content: 'Content of Post 3' },]
  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <h2><Link href={`/post/${post.id}`}>{post.title}</Link></h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}

export default PostPage
