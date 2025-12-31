'use client'

import { useEffect, useRef } from 'react'

interface BlogContentProps {
  content: string
}

export default function BlogContent({ content }: BlogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Convert markdown-style content to HTML with proper formatting
    const formattedContent = formatMarkdownContent(content)
    contentRef.current.innerHTML = formattedContent

    // Add IDs to headings for table of contents
    const headings = contentRef.current.querySelectorAll('h2, h3')
    headings.forEach(heading => {
      const text = heading.textContent || ''
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      heading.id = id
    })
  }, [content])

  return (
    <div
      ref={contentRef}
      className="prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-secondary
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:text-muted prose-p:leading-relaxed prose-p:mb-6
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-secondary prose-strong:font-bold
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-muted prose-li:mb-2
        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic
        prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-6 prose-pre:rounded-xl prose-pre:overflow-x-auto
        prose-table:border-collapse prose-table:w-full
        prose-th:bg-gray-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold
        prose-td:border prose-td:border-gray-200 prose-td:p-3
        prose-hr:border-gray-200 prose-hr:my-12
        prose-img:rounded-xl prose-img:shadow-lg"
    />
  )
}

function formatMarkdownContent(markdown: string): string {
  let html = markdown

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  // Line breaks to paragraphs
  html = html.replace(/\n\n/g, '</p><p>')

  // Unordered lists
  html = html.replace(/^\- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

  // Blockquotes
  html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

  // Tables
  html = html.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map((cell: string) => cell.trim())
    return `<tr>${cells.map((cell: string) => `<td>${cell}</td>`).join('')}</tr>`
  })
  html = html.replace(/(<tr>.*<\/tr>)/s, '<table>$1</table>')

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p>${html}</p>`
  }

  return html
}
