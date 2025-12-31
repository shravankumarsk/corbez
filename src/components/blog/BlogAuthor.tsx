import Image from 'next/image'
import { BlogAuthor as Author } from '@/lib/content/blog-posts'

interface BlogAuthorProps {
  author: Author
}

export default function BlogAuthor({ author }: BlogAuthorProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          <Image src={author.avatar} alt={author.name} fill className="object-cover" />
        </div>

        <div className="flex-1">
          <div className="mb-1">
            <h3 className="text-xl font-bold text-secondary">{author.name}</h3>
            <p className="text-sm text-primary font-medium">{author.role}</p>
          </div>
          <p className="text-muted text-sm leading-relaxed">{author.bio}</p>
        </div>
      </div>
    </div>
  )
}
