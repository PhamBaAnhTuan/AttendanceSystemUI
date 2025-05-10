
export default function BlogLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return <div>
      <h1>Welcome! its list post</h1>
      {children}
   </div>
}