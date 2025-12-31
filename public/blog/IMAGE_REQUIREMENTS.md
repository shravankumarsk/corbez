# Blog Image Requirements

## Featured Images for Blog Posts

All images should be placed in `/public/blog/`

### Required Images

1. **commission-free-restaurant-marketing.jpg**
   - Subject: Restaurant owner reviewing financial documents showing commission savings
   - Mood: Professional, optimistic, data-focused
   - Colors: Warm tones, professional lighting
   - Text overlay: None (clean image)

2. **attract-corporate-customers-restaurant.jpg**
   - Subject: Corporate employees enjoying lunch at local restaurant
   - Mood: Social, professional, happy
   - Colors: Bright, inviting atmosphere
   - Setting: Modern restaurant interior

3. **hidden-costs-delivery-apps.jpg**
   - Subject: Restaurant owner analyzing delivery platform costs on calculator
   - Mood: Concerned but analytical
   - Colors: Neutral, professional
   - Props: Calculator, invoices, laptop showing platform dashboard

4. **restaurant-discount-strategy.jpg**
   - Subject: Restaurant owner calculating optimal discount percentage
   - Mood: Strategic, thoughtful
   - Colors: Professional, clean
   - Props: Calculator, menu, profit margin charts

5. **six-month-free-trial.jpg**
   - Subject: Restaurant owner signing up for free trial on laptop
   - Mood: Excited, optimistic
   - Colors: Bright, positive
   - Setting: Restaurant office or counter area

6. **zero-cost-employee-benefits.jpg**
   - Subject: HR manager presenting employee benefits to team
   - Mood: Professional, engaging
   - Colors: Corporate, clean
   - Setting: Modern office/conference room

7. **reduce-employee-turnover.jpg**
   - Subject: Employees enjoying lunch together in office
   - Mood: Happy, collaborative
   - Colors: Warm, inviting
   - Setting: Office lunch area or local restaurant

### Image Specifications

**Dimensions:** 1200 x 630 pixels (16:9 aspect ratio)
**Format:** JPEG (optimized) or WebP
**File Size:** <200KB (target: 100-150KB)
**Color Space:** sRGB
**Resolution:** 72 DPI (web standard)
**Optimization:** Use TinyPNG, ImageOptim, or similar

### Image Sources

**Option 1: Stock Photos (Free)**
- Unsplash (unsplash.com) - High-quality, free
- Pexels (pexels.com) - Free stock photos
- Pixabay (pixabay.com) - Free images

**Option 2: Stock Photos (Paid)**
- Shutterstock (shutterstock.com)
- Getty Images (gettyimages.com)
- Adobe Stock (stock.adobe.com)

**Option 3: Custom Photography**
- Hire local photographer
- Use iPhone/smartphone with good lighting
- Edit with Canva, Photoshop, or GIMP

### Image Optimization Workflow

1. Source/create image at high resolution (2400x1260px minimum)
2. Crop/compose to 1200x630px
3. Adjust brightness, contrast, saturation
4. Export as JPEG (quality: 80-85%)
5. Run through TinyPNG or ImageOptim
6. Verify file size <200KB
7. Save to `/public/blog/`

### Alt Text Guidelines

Each image needs descriptive alt text for SEO and accessibility:

**Good alt text examples:**
- "Restaurant owner reviewing financial reports showing savings from commission-free platform"
- "Group of corporate employees enjoying lunch together at local restaurant"
- "HR manager presenting new employee benefits package in modern office"

**Bad alt text examples:**
- "Image 1" (not descriptive)
- "Restaurant" (too vague)
- "Photo of people eating" (not specific enough)

## Author Avatars

All avatars should be placed in `/public/team/`

### Required Avatars

1. **sarah-chen.jpg**
   - Name: Sarah Chen
   - Title: Head of Restaurant Partnerships
   - Style: Professional headshot
   - Background: Neutral or blurred

2. **michael-rodriguez.jpg**
   - Name: Michael Rodriguez
   - Title: Corporate Benefits Strategist
   - Style: Professional headshot
   - Background: Neutral or blurred

3. **emily-wilson.jpg**
   - Name: Emily Wilson
   - Title: Market Research Analyst
   - Style: Professional headshot
   - Background: Neutral or blurred

4. **david-kim.jpg**
   - Name: David Kim
   - Title: Content & Community Lead
   - Style: Professional headshot
   - Background: Neutral or blurred

### Avatar Specifications

**Dimensions:** 400 x 400 pixels (1:1 square)
**Format:** JPEG or PNG
**File Size:** <50KB (target: 20-30KB)
**Background:** Solid color or professional blur
**Style:** Professional business casual
**Expression:** Approachable, confident

### Avatar Sources

**Option 1: AI-Generated (Recommended for placeholder)**
- This Person Does Not Exist (thispersondoesnotexist.com)
- Generated Photos (generated.photos)
- Profile Pic Maker (profilepicmaker.com)

**Option 2: Stock Photos**
- Unsplash portraits
- Pexels people
- Search for "professional headshot"

**Option 3: Real Team Photos**
- Professional headshot photographer
- Consistent lighting/background across all photos
- Business casual attire

## Placeholder Images

Until final images are ready, you can use placeholder services:

### For Blog Featured Images (1200x630)
```html
<img src="https://via.placeholder.com/1200x630/F45D48/ffffff?text=Blog+Post+Image" alt="Placeholder" />
```

### For Author Avatars (400x400)
```html
<img src="https://via.placeholder.com/400x400/1F2937/ffffff?text=Author" alt="Author Avatar" />
```

Or use dynamic services:
- Lorem Picsum: `https://picsum.photos/1200/630`
- Unsplash Random: `https://source.unsplash.com/1200x630/?restaurant,business`

## Image Checklist

Before publishing a blog post, verify:

- [ ] Featured image created/sourced (1200x630px)
- [ ] Image optimized (<200KB)
- [ ] Image saved to `/public/blog/[filename].jpg`
- [ ] Filename matches `image.url` in blog-posts.ts
- [ ] Alt text is descriptive and includes keywords
- [ ] Image displays correctly on listing page
- [ ] Image displays correctly on post page
- [ ] Image appears in Open Graph social shares
- [ ] Author avatar exists (400x400px)
- [ ] Author avatar optimized (<50KB)
- [ ] Avatar saved to `/public/team/[filename].jpg`

## Image Performance

### Current Implementation
- Next.js Image component provides automatic optimization
- Lazy loading for below-fold images
- Responsive images (srcset) automatically generated
- WebP format served to supported browsers

### Best Practices
1. **Always use Next.js Image component**
   ```tsx
   import Image from 'next/image'
   <Image src="/blog/post.jpg" alt="Description" width={1200} height={630} />
   ```

2. **Specify dimensions** to prevent layout shift
3. **Use priority** for above-fold images
   ```tsx
   <Image src={post.image.url} alt={post.image.alt} fill priority />
   ```

4. **Optimize before upload** - don't rely solely on runtime optimization

## Quick Commands

### Optimize all blog images (ImageMagick)
```bash
cd public/blog
for img in *.jpg; do
  convert "$img" -resize 1200x630^ -gravity center -extent 1200x630 -quality 85 "optimized-$img"
done
```

### Optimize all avatars
```bash
cd public/team
for img in *.jpg; do
  convert "$img" -resize 400x400^ -gravity center -extent 400x400 -quality 85 "optimized-$img"
done
```

### Batch compress with TinyPNG CLI
```bash
npm install -g tinypng-cli
tinypng public/blog/*.jpg
tinypng public/team/*.jpg
```

---

**Last Updated:** December 31, 2025
**Note:** Replace all placeholder images before production launch
