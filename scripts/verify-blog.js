#!/usr/bin/env node

/**
 * Blog System Verification Script
 * Verifies all blog posts, images, and links are properly configured
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Corbez Blog System...\n')

// Check if blog-posts.ts exists
const blogPostsPath = path.join(__dirname, '../src/lib/content/blog-posts.ts')
if (!fs.existsSync(blogPostsPath)) {
  console.error('❌ blog-posts.ts not found at:', blogPostsPath)
  process.exit(1)
}
console.log('✅ Blog posts file exists')

// Check blog components
const componentsDir = path.join(__dirname, '../src/components/blog')
const requiredComponents = [
  'BlogCard.tsx',
  'BlogHero.tsx',
  'BlogAuthor.tsx',
  'BlogCTA.tsx',
  'RelatedPosts.tsx',
  'TableOfContents.tsx',
]

let missingComponents = []
requiredComponents.forEach(component => {
  const componentPath = path.join(componentsDir, component)
  if (fs.existsSync(componentPath)) {
    console.log(`✅ Component exists: ${component}`)
  } else {
    console.log(`❌ Missing component: ${component}`)
    missingComponents.push(component)
  }
})

// Check blog app routes
const blogAppDir = path.join(__dirname, '../src/app/blog')
const requiredRoutes = ['page.tsx', 'BlogListing.tsx', 'layout.tsx', '[slug]/page.tsx', '[slug]/BlogContent.tsx']

let missingRoutes = []
requiredRoutes.forEach(route => {
  const routePath = path.join(blogAppDir, route)
  if (fs.existsSync(routePath)) {
    console.log(`✅ Route exists: ${route}`)
  } else {
    console.log(`❌ Missing route: ${route}`)
    missingRoutes.push(route)
  }
})

// Check image directories
const blogImagesDir = path.join(__dirname, '../public/blog')
const teamImagesDir = path.join(__dirname, '../public/team')

if (fs.existsSync(blogImagesDir)) {
  const blogImages = fs.readdirSync(blogImagesDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
  console.log(`✅ Blog images directory exists (${blogImages.length} images)`)
} else {
  console.log('⚠️  Blog images directory not found - you need to add featured images')
}

if (fs.existsSync(teamImagesDir)) {
  const teamImages = fs.readdirSync(teamImagesDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
  console.log(`✅ Team images directory exists (${teamImages.length} avatars)`)
} else {
  console.log('⚠️  Team images directory not found - you need to add author avatars')
}

// Summary
console.log('\n📊 Verification Summary:')
console.log('========================')

const totalIssues = missingComponents.length + missingRoutes.length

if (totalIssues === 0) {
  console.log('✅ All core blog system files are in place!')
  console.log('\n⚠️  Next steps:')
  console.log('   1. Add featured images to /public/blog/')
  console.log('   2. Add author avatars to /public/team/')
  console.log('   3. Run: npm run dev')
  console.log('   4. Visit: http://localhost:3000/blog')
  console.log('   5. Test filtering, search, and individual posts')
} else {
  console.log(`❌ Found ${totalIssues} issues:`)
  if (missingComponents.length > 0) {
    console.log(`   - Missing components: ${missingComponents.join(', ')}`)
  }
  if (missingRoutes.length > 0) {
    console.log(`   - Missing routes: ${missingRoutes.join(', ')}`)
  }
  process.exit(1)
}

console.log('\n📚 Documentation:')
console.log('   - Full guide: /BLOG_SYSTEM_DOCUMENTATION.md')
console.log('   - Image specs: /public/blog/IMAGE_REQUIREMENTS.md')
console.log('\n')
