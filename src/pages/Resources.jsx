"use client"

import { useState } from "react"
import { Book, Video, FileText, ExternalLink, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedResource, setExpandedResource] = useState(null)

  const resources = [
    {
      id: 1,
      title: "Getting Started with Influencer Marketing",
      description: "Learn the basics of influencer marketing and how to create your first campaign.",
      category: "guide",
      type: "article",
      readTime: "10 min read",
      content: `
        <h2>Introduction to Influencer Marketing</h2>
        <p>Influencer marketing is a form of social media marketing involving endorsements and product placements from individuals who have a dedicated social following and are viewed as experts within their niche.</p>
        
        <h3>Why Influencer Marketing Works</h3>
        <p>Influencer marketing works because it uses the elements of social proof and trust. When consumers see a product endorsed by someone they admire and trust, they're more likely to purchase it.</p>
        
        <h3>Key Benefits</h3>
        <ul>
          <li>Builds brand awareness and credibility</li>
          <li>Reaches targeted and engaged audiences</li>
          <li>Creates authentic content that resonates with consumers</li>
          <li>Drives conversions and sales</li>
        </ul>
        
        <h3>Getting Started</h3>
        <ol>
          <li>Define your campaign goals and KPIs</li>
          <li>Identify your target audience</li>
          <li>Set a realistic budget</li>
          <li>Find the right influencers for your brand</li>
          <li>Create a clear brief with campaign requirements</li>
          <li>Track and measure results</li>
        </ol>
      `,
    },
    {
      id: 2,
      title: "How to Choose the Right Influencers for Your Brand",
      description:
        "A comprehensive guide to selecting influencers that align with your brand values and target audience.",
      category: "guide",
      type: "article",
      readTime: "15 min read",
      content: `
        <h2>Finding the Perfect Match for Your Brand</h2>
        <p>Selecting the right influencers is crucial for campaign success. This guide will help you identify influencers who align with your brand values and can effectively reach your target audience.</p>
        
        <h3>Key Factors to Consider</h3>
        <ul>
          <li><strong>Relevance:</strong> Does the influencer's content align with your industry and brand?</li>
          <li><strong>Engagement:</strong> Look beyond follower count to engagement rates (likes, comments, shares)</li>
          <li><strong>Authenticity:</strong> Review past content to ensure genuine connection with their audience</li>
          <li><strong>Audience Demographics:</strong> Ensure their followers match your target market</li>
          <li><strong>Content Quality:</strong> Assess the quality and professionalism of their content</li>
        </ul>
        
        <h3>Red Flags to Watch For</h3>
        <ul>
          <li>Sudden spikes in follower growth (potential purchased followers)</li>
          <li>Low engagement relative to follower count</li>
          <li>Inconsistent posting schedule</li>
          <li>Excessive sponsored content that feels inauthentic</li>
        </ul>
        
        <h3>Micro vs. Macro Influencers</h3>
        <p>Consider working with micro-influencers (10K-100K followers) who often have higher engagement rates and more dedicated audiences than macro-influencers, despite having fewer followers.</p>
      `,
    },
    {
      id: 3,
      title: "Creating Effective Campaign Briefs",
      description: "Learn how to create clear, comprehensive campaign briefs that set your influencers up for success.",
      category: "guide",
      type: "article",
      readTime: "8 min read",
      content: `
        <h2>The Art of the Campaign Brief</h2>
        <p>A well-crafted campaign brief is essential for communicating your expectations and ensuring influencers deliver content that meets your objectives.</p>
        
        <h3>Essential Elements of a Campaign Brief</h3>
        <ul>
          <li><strong>Campaign Overview:</strong> Brief description of the campaign and its goals</li>
          <li><strong>Brand Guidelines:</strong> Key messaging, tone of voice, dos and don'ts</li>
          <li><strong>Deliverables:</strong> Specific content requirements (number of posts, format, length)</li>
          <li><strong>Timeline:</strong> Content submission deadlines and posting schedule</li>
          <li><strong>Key Talking Points:</strong> Product features or benefits to highlight</li>
          <li><strong>Hashtags and Tags:</strong> Required hashtags, account tags, and disclosure requirements</li>
          <li><strong>Approval Process:</strong> How and when content will be reviewed</li>
        </ul>
        
        <h3>Tips for Success</h3>
        <ul>
          <li>Be clear and specific while allowing room for creativity</li>
          <li>Include visual examples of the type of content you're looking for</li>
          <li>Provide all necessary product information and resources</li>
          <li>Clearly communicate compensation and payment terms</li>
        </ul>
      `,
    },
    {
      id: 4,
      title: "Measuring Influencer Marketing ROI",
      description: "Strategies and metrics for tracking the success of your influencer marketing campaigns.",
      category: "analytics",
      type: "article",
      readTime: "12 min read",
      content: `
        <h2>Tracking Campaign Performance</h2>
        <p>Measuring the ROI of influencer marketing campaigns is essential for optimizing your strategy and demonstrating value to stakeholders.</p>
        
        <h3>Key Performance Indicators (KPIs)</h3>
        <ul>
          <li><strong>Reach and Impressions:</strong> Total audience exposure to your campaign</li>
          <li><strong>Engagement:</strong> Likes, comments, shares, and saves</li>
          <li><strong>Website Traffic:</strong> Visitors from influencer content</li>
          <li><strong>Conversions:</strong> Sign-ups, downloads, or purchases</li>
          <li><strong>Sales and Revenue:</strong> Direct sales attributed to the campaign</li>
          <li><strong>Brand Sentiment:</strong> Changes in perception and audience feedback</li>
        </ul>
        
        <h3>Tracking Methods</h3>
        <ul>
          <li><strong>UTM Parameters:</strong> Track traffic sources in Google Analytics</li>
          <li><strong>Promo Codes:</strong> Unique discount codes for each influencer</li>
          <li><strong>Affiliate Links:</strong> Custom tracking links for each influencer</li>
          <li><strong>Pixel Tracking:</strong> Monitor user behavior after clicking on influencer content</li>
        </ul>
        
        <h3>Calculating ROI</h3>
        <p>ROI = (Value Generated - Campaign Cost) / Campaign Cost × 100</p>
        <p>Remember that some benefits, like brand awareness and credibility, may be harder to quantify but still valuable.</p>
      `,
    },
    {
      id: 5,
      title: "Influencer Marketing Legal Guidelines",
      description: "Understanding disclosure requirements and legal considerations for influencer campaigns.",
      category: "legal",
      type: "article",
      readTime: "10 min read",
      content: `
        <h2>Navigating Legal Requirements</h2>
        <p>Compliance with advertising regulations is essential when running influencer marketing campaigns to avoid penalties and maintain consumer trust.</p>
        
        <h3>Disclosure Requirements</h3>
        <p>In most countries, influencers must clearly disclose their relationship with brands when posting sponsored content. This typically includes:</p>
        <ul>
          <li>Using hashtags like #ad, #sponsored, or #paid</li>
          <li>Placing disclosures prominently at the beginning of captions</li>
          <li>Verbal disclosures in videos</li>
          <li>Avoiding vague terms like #sp, #collab, or #ambassador</li>
        </ul>
        
        <h3>Regional Regulations</h3>
        <ul>
          <li><strong>United States:</strong> FTC guidelines require clear and conspicuous disclosures</li>
          <li><strong>European Union:</strong> The Unfair Commercial Practices Directive requires transparency</li>
          <li><strong>United Kingdom:</strong> ASA and CMA provide specific guidelines for influencer marketing</li>
        </ul>
        
        <h3>Contract Considerations</h3>
        <ul>
          <li>Content ownership and usage rights</li>
          <li>Exclusivity clauses and competitor restrictions</li>
          <li>Content approval processes</li>
          <li>Performance expectations and deliverables</li>
          <li>Payment terms and cancellation policies</li>
        </ul>
      `,
    },
    {
      id: 6,
      title: "Influencer Content Creation Best Practices",
      description: "Tips for influencers on creating authentic, engaging content that resonates with audiences.",
      category: "influencer",
      type: "video",
      readTime: "Video - 18 min",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 7,
      title: "Building Long-term Influencer Relationships",
      description: "Strategies for brands to develop ongoing partnerships with influencers for maximum impact.",
      category: "brand",
      type: "article",
      readTime: "9 min read",
      content: `
        <h2>From One-off Campaigns to Strategic Partnerships</h2>
        <p>Long-term influencer relationships can deliver greater ROI and more authentic content than one-time collaborations.</p>
        
        <h3>Benefits of Long-term Partnerships</h3>
        <ul>
          <li>More authentic brand advocacy</li>
          <li>Better understanding of your brand and products</li>
          <li>Consistent messaging over time</li>
          <li>Higher audience trust and engagement</li>
          <li>More efficient use of marketing budget</li>
          <li>Simplified campaign management</li>
        </ul>
        
        <h3>Building Lasting Relationships</h3>
        <ul>
          <li><strong>Fair Compensation:</strong> Value influencers' time and expertise appropriately</li>
          <li><strong>Creative Freedom:</strong> Trust influencers to know what resonates with their audience</li>
          <li><strong>Open Communication:</strong> Maintain regular contact beyond campaign periods</li>
          <li><strong>Exclusive Opportunities:</strong> Offer early access to products and special events</li>
          <li><strong>Feedback Loop:</strong> Share performance data and insights</li>
        </ul>
        
        <h3>Partnership Models</h3>
        <ul>
          <li><strong>Brand Ambassador Programs:</strong> Ongoing representation of your brand</li>
          <li><strong>Content Licensing:</strong> Extended usage rights for influencer content</li>
          <li><strong>Product Development:</strong> Collaborating on new products or collections</li>
          <li><strong>Affiliate Partnerships:</strong> Commission-based ongoing promotion</li>
        </ul>
      `,
    },
    {
      id: 8,
      title: "Influencer Rate Guide 2023",
      description:
        "Current industry standards for influencer compensation across different platforms and follower counts.",
      category: "brand",
      type: "downloadable",
      readTime: "PDF - 15 pages",
      fileUrl: "#",
    },
    {
      id: 9,
      title: "Negotiating Influencer Contracts",
      description: "Tips for both brands and influencers on negotiating fair, effective collaboration agreements.",
      category: "both",
      type: "article",
      readTime: "11 min read",
      content: `
        <h2>Creating Win-Win Partnerships</h2>
        <p>Successful influencer marketing relies on clear, fair contracts that protect both parties and set expectations.</p>
        
        <h3>For Brands: Key Negotiation Points</h3>
        <ul>
          <li><strong>Deliverables:</strong> Be specific about content quantity, type, and quality</li>
          <li><strong>Usage Rights:</strong> Clarify how and where you can use the influencer's content</li>
          <li><strong>Exclusivity:</strong> Determine if and how long the influencer should avoid promoting competitors</li>
          <li><strong>Approval Process:</strong> Establish a timeline and process for content review</li>
          <li><strong>Performance Metrics:</strong> Set clear expectations for engagement or conversion targets</li>
        </ul>
        
        <h3>For Influencers: Protecting Your Interests</h3>
        <ul>
          <li><strong>Scope Limitations:</strong> Clearly define what is and isn't included in the fee</li>
          <li><strong>Payment Terms:</strong> Specify payment timing, methods, and any deposits required</li>
          <li><strong>Creative Control:</strong> Maintain appropriate input on content creation</li>
          <li><strong>Kill Fee:</strong> Include compensation if the campaign is canceled</li>
          <li><strong>Portfolio Usage:</strong> Ensure you can use the content in your portfolio</li>
        </ul>
        
        <h3>Negotiation Tips</h3>
        <ul>
          <li>Research market rates before discussions begin</li>
          <li>Consider value beyond monetary compensation (exposure, products, experiences)</li>
          <li>Be transparent about budget constraints and expectations</li>
          <li>Focus on creating long-term relationships, not just one-off deals</li>
        </ul>
      `,
    },
    {
      id: 10,
      title: "Platform-Specific Influencer Strategies",
      description:
        "Tailoring your influencer campaigns for different social media platforms (Instagram, TikTok, YouTube, etc.).",
      category: "guide",
      type: "article",
      readTime: "14 min read",
      content: `
        <h2>Optimizing for Each Platform</h2>
        <p>Each social media platform has unique features, audience behaviors, and content formats that require tailored approaches.</p>
        
        <h3>Instagram</h3>
        <ul>
          <li><strong>Content Types:</strong> Feed posts, Stories, Reels, IGTV, Guides</li>
          <li><strong>Best Practices:</strong> Visually appealing content, product tags, swipe-up links (for eligible accounts)</li>
          <li><strong>Metrics to Track:</strong> Engagement rate, saves, story completion rate</li>
        </ul>
        
        <h3>TikTok</h3>
        <ul>
          <li><strong>Content Types:</strong> Short-form videos, challenges, tutorials</li>
          <li><strong>Best Practices:</strong> Authentic, trend-based content; music integration; minimal production</li>
          <li><strong>Metrics to Track:</strong> Views, shares, comments, hashtag usage</li>
        </ul>
        
        <h3>YouTube</h3>
        <ul>
          <li><strong>Content Types:</strong> Reviews, tutorials, unboxings, day-in-the-life</li>
          <li><strong>Best Practices:</strong> Detailed product information, longer format, searchable content</li>
          <li><strong>Metrics to Track:</strong> Watch time, click-through rate, subscriber growth</li>
        </ul>
        
        <h3>Twitter</h3>
        <ul>
          <li><strong>Content Types:</strong> Short text updates, polls, threads</li>
          <li><strong>Best Practices:</strong> Timely content, conversation starters, thread storytelling</li>
          <li><strong>Metrics to Track:</strong> Retweets, replies, link clicks</li>
        </ul>
        
        <h3>LinkedIn</h3>
        <ul>
          <li><strong>Content Types:</strong> Thought leadership, industry insights, professional development</li>
          <li><strong>Best Practices:</strong> Professional tone, data-backed content, B2B focus</li>
          <li><strong>Metrics to Track:</strong> Profile views, connection requests, content engagement</li>
        </ul>
      `,
    },
  ]

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleExpand = (id) => {
    if (expandedResource === id) {
      setExpandedResource(null)
    } else {
      setExpandedResource(id)
    }
  }

  const getResourceIcon = (type) => {
    switch (type) {
      case "article":
        return <FileText className="h-5 w-5 text-emerald-500" />
      case "video":
        return <Video className="h-5 w-5 text-emerald-500" />
      case "downloadable":
        return <Book className="h-5 w-5 text-emerald-500" />
      default:
        return <FileText className="h-5 w-5 text-emerald-500" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Resources</h1>
        <p className="text-gray-600 mb-8">
          Explore our collection of guides, articles, and tools to help you succeed with influencer marketing.
        </p>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="input-field appearance-none pr-10"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="guide">Guides</option>
                <option value="analytics">Analytics</option>
                <option value="legal">Legal</option>
                <option value="brand">For Brands</option>
                <option value="influencer">For Influencers</option>
                <option value="both">For Both</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600 mb-4">No resources found matching your criteria.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredResources.map((resource) => (
              <div key={resource.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">{getResourceIcon(resource.type)}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        {resource.readTime}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{resource.description}</p>

                    {resource.type === "article" && (
                      <button
                        className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium"
                        onClick={() => toggleExpand(resource.id)}
                      >
                        {expandedResource === resource.id ? (
                          <>
                            Read Less <ChevronUp className="h-4 w-4 ml-1" />
                          </>
                        ) : (
                          <>
                            Read More <ChevronDown className="h-4 w-4 ml-1" />
                          </>
                        )}
                      </button>
                    )}

                    {resource.type === "video" && (
                      <a
                        href={resource.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium"
                      >
                        Watch Video <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    )}

                    {resource.type === "downloadable" && (
                      <a
                        href={resource.fileUrl}
                        className="text-emerald-600 hover:text-emerald-700 flex items-center text-sm font-medium"
                      >
                        Download PDF <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    )}

                    {expandedResource === resource.id && resource.content && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div
                          className="prose prose-emerald max-w-none"
                          dangerouslySetInnerHTML={{ __html: resource.content }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Resources
