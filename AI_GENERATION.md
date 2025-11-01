# AI POI Generation Guide

This guide explains how to use the AI-powered POI generation feature in Navigame Admin.

## Overview

The AI POI Generation feature allows you to quickly generate realistic Points of Interest (POIs) using various AI models from OpenRouter. Instead of manually entering each POI, you can describe what you want and let AI generate multiple POIs at once.

## Prerequisites

### 1. OpenRouter Account Setup

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account (you can use Google, GitHub, or email)
3. Navigate to **Keys** section in your account
4. Click **Create Key**
5. Copy the API key (format: `sk-or-v1-...`)
6. Add credits to your account:
   - Go to **Credits** section
   - Add funds (most models cost $0.001-0.015 per request)
   - $5 is typically enough for thousands of POI generations

### 2. Environment Configuration

Add your OpenRouter API key to `.env.local`:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

Restart your development server after adding the key:

```bash
npm run dev
```

## How to Use

### Step 1: Navigate to AI Generate

Click **AI Generate** in the sidebar navigation (🤖 icon).

### Step 2: Select AI Model

Choose from available models in the dropdown:

**Recommended Models:**
- **Claude 3.5 Sonnet** - Best quality, good for complex descriptions
- **GPT-4 Turbo** - Excellent quality, fast responses
- **Gemini Pro 1.5** - Good balance of quality and cost
- **Llama 3.1 70B** - Open source, cost-effective

**Cost Comparison:**
- Claude 3.5 Sonnet: ~$0.003-0.015 per request
- GPT-4 Turbo: ~$0.01-0.03 per request
- Gemini Pro: ~$0.001-0.007 per request
- Llama 3.1 70B: ~$0.0008-0.002 per request

### Step 3: Write Your Prompt

Describe what kind of POIs you want to generate. Be specific and detailed.

**Good Prompts:**
```
Popular tourist attractions in Paris with historical significance.
Include famous landmarks, museums, and monuments that are must-see for first-time visitors.
```

```
Family-friendly restaurants with outdoor seating and playgrounds.
Focus on casual dining spots with kid's menus and reasonable prices.
```

```
Boutique hotels in downtown areas with rooftop bars.
Include upscale accommodations with unique architectural features.
```

**Poor Prompts:**
```
Make some restaurants
```

```
Generate POIs
```

### Step 4: Select Location and Category

1. **Country**: Choose the country
2. **City**: Select a city (filtered by country)
3. **Category**: Choose the category (e.g., Museums, Restaurants, Hotels)

### Step 5: Set Generation Parameters

**Number of POIs:**
- Minimum: 1
- Maximum: 50
- Recommended: 5-10 for testing

**Dynamic Fields (Optional):**
Enter comma-separated field names that should be included in each POI.

Examples:
- `phone, website, opening_hours`
- `price_range, rating, wifi_available`
- `parking, wheelchair_accessible, accepts_credit_cards`

The AI will generate realistic values for these fields.

### Step 6: Generate

Click **Generate POIs** button. This typically takes 5-30 seconds depending on:
- Number of POIs requested
- AI model selected
- Complexity of dynamic fields

### Step 7: Review Generated POIs

The generated POIs will appear below the form with:
- Name
- Address (realistic street address in the selected city)
- Dynamic fields (if specified)

**Review Each POI:**
- Check if the name makes sense
- Verify the address looks realistic
- Review dynamic field values
- Remove any POIs you don't want by clicking "Remove"

### Step 8: Import POIs

Once satisfied with the generated POIs:

1. Click **Import All** button
2. All remaining POIs will be added to your database
3. They'll appear in the POIs list immediately
4. Each POI will be associated with:
   - Selected city (with city name stored)
   - Selected category (with category name stored)
   - Generated address
   - Generated dynamic fields

## Tips for Better Results

### Writing Effective Prompts

1. **Be Specific**: Instead of "restaurants", say "Italian restaurants with authentic pizza ovens"
2. **Add Context**: Mention price range, atmosphere, target audience
3. **Include Attributes**: Describe features you want (parking, WiFi, outdoor seating)
4. **Use Examples**: "Like Museo del Prado but for modern art"

### Prompt Examples by Category

**Restaurants:**
```
Upscale Mediterranean restaurants with wine cellars and tasting menus.
Focus on establishments with Michelin stars or equivalent recognition.
Include seafood-focused options with waterfront views.
```

**Hotels:**
```
Budget-friendly hostels and guesthouses near public transportation.
Include dormitory-style and private room options with shared kitchens.
Prioritize places with high cleanliness ratings and social atmosphere.
```

**Museums:**
```
Interactive science and technology museums suitable for children ages 5-12.
Include hands-on exhibits, planetariums, and educational programs.
Focus on STEM learning with engaging displays.
```

**Landmarks:**
```
Historic churches and cathedrals with architectural significance from medieval period.
Include UNESCO World Heritage sites and places with guided tours available.
Mention notable features like stained glass windows or crypts.
```

### Optimizing Dynamic Fields

**For Restaurants:**
```
phone, website, opening_hours, price_range, cuisine_type, outdoor_seating, reservations_required
```

**For Hotels:**
```
phone, website, check_in_time, check_out_time, star_rating, parking, breakfast_included
```

**For Museums:**
```
phone, website, opening_hours, ticket_price, guided_tours, accessibility, photography_allowed
```

**For Activities:**
```
phone, website, duration, age_requirement, booking_required, group_discounts
```

## Best Practices

### 1. Start Small
Generate 3-5 POIs first to test the quality. Once satisfied, generate larger batches.

### 2. Use Appropriate Models
- **Complex Descriptions**: Use Claude 3.5 Sonnet or GPT-4
- **Simple Lists**: Use Gemini Pro or Llama 3.1
- **Bulk Generation**: Use cost-effective models

### 3. Review Before Import
Always review generated content. AI may occasionally produce:
- Fictional or incorrect information
- Duplicate-sounding names
- Unrealistic details

### 4. Combine with Manual Editing
After importing, you can still edit POIs manually if needed:
1. Go to POIs page
2. Click "Edit" on any POI
3. Modify fields as needed

### 5. Batch by Category
Generate POIs category by category for better organization:
1. First: Generate all Museums
2. Then: Generate all Restaurants
3. Finally: Generate all Hotels

## Troubleshooting

### "No response from AI"
- Check your internet connection
- Verify OpenRouter API key is correct
- Check if you have credits in OpenRouter account
- Try a different model

### Generated POIs don't match prompt
- Make your prompt more specific
- Try a different AI model
- Add more context to the prompt
- Include examples of what you want

### Invalid JSON error
- This is rare but can happen
- Simply regenerate - the AI will produce valid output
- Try a different model if it persists

### Rate limiting
- OpenRouter has rate limits per API key
- Wait a few seconds between requests
- Upgrade your OpenRouter account for higher limits

### Model not available
- Some models may be temporarily unavailable
- Select a different model from the dropdown
- Check OpenRouter status page

## Cost Management

### Estimate Costs
- Small test (5 POIs with 3 fields): ~$0.01-0.03
- Medium batch (20 POIs with 5 fields): ~$0.03-0.10
- Large batch (50 POIs with 8 fields): ~$0.10-0.30

### Cost-Saving Tips
1. **Use cheaper models** for simple lists (Llama, Gemini)
2. **Reduce dynamic fields** - each field increases cost
3. **Generate fewer POIs** per request
4. **Write clear prompts** to avoid regenerations
5. **Review carefully** to avoid wasted imports

### Monitor Usage
1. Log into OpenRouter dashboard
2. Go to **Usage** section
3. Check daily/monthly spending
4. Set budget alerts if needed

## Advanced Usage

### Generating with Context

Include context in your prompt for better results:

```
Generate luxury hotels in Tokyo targeting business travelers.

Context:
- Near major business districts (Shibuya, Shinjuku, Marunouchi)
- Include conference room facilities
- Emphasize proximity to train stations
- Price range: $200-500 per night
- Modern amenities: high-speed internet, fitness centers
```

### Using Multiple Rounds

For large datasets:
1. Generate 10 museums with basic fields
2. Review and import
3. Generate 10 more with different characteristics
4. Continue until you have desired quantity

### Combining Manual and AI

1. Create categories and cities manually first
2. Use AI to generate POIs in bulk
3. Manually add unique or special POIs
4. Use AI to fill in gaps

## Example Workflows

### Workflow 1: New City Setup

**Goal**: Populate a new city with diverse POIs

1. Add city to database manually
2. Generate 10 popular tourist attractions
3. Generate 10 restaurants (mix of cuisines)
4. Generate 5 hotels (different price ranges)
5. Generate 5 museums
6. Review all and import

**Time**: ~10 minutes instead of hours

### Workflow 2: Category Expansion

**Goal**: Add more POIs to existing category

1. Navigate to AI Generate
2. Select existing city and category
3. Write specific prompt for this batch
4. Generate 5-10 POIs
5. Review for duplicates against existing
6. Import unique ones

**Time**: ~2-3 minutes

### Workflow 3: Field Enhancement

**Goal**: Add more details to existing POIs

1. Generate new POIs with extensive dynamic fields
2. Review field values
3. Manually copy good field values to existing POIs
4. Discard the generated POIs

**Time**: Saves research time for realistic values

## Security & Privacy

- API keys are stored in environment variables (not in database)
- API keys are only exposed to the client (use NEXT_PUBLIC_ prefix)
- All generated content should be reviewed before use
- AI-generated content may include copyrighted names (review carefully)
- No user data is sent to AI (only prompts and parameters)

## Frequently Asked Questions

**Q: Can I generate POIs offline?**
A: No, requires internet connection to OpenRouter API.

**Q: Are generated addresses real?**
A: Addresses are AI-generated and may not be real. Verify important POIs.

**Q: Can I use my own AI model?**
A: Only models available on OpenRouter are supported.

**Q: How do I get more credits?**
A: Log into OpenRouter, go to Credits, and add funds via card.

**Q: Can I bulk edit generated POIs?**
A: Review in preview, remove unwanted, then import all at once.

**Q: Does this work with other languages?**
A: Yes! Write prompts in any language, and AI will respond accordingly.

**Q: Can I save prompts for reuse?**
A: Not currently, but you can copy/paste prompts you use often.

**Q: What if I hit rate limits?**
A: Wait a minute or upgrade your OpenRouter plan.

## Limitations

- AI may generate fictional information
- Addresses may not be 100% accurate
- Dynamic field values are estimates
- Cannot generate real-time information (hours, prices change)
- Some duplicates may occur in large batches
- Quality varies by model
- Requires internet and API credits

## Future Enhancements

Potential features being considered:
- Prompt templates library
- Batch operations across multiple cities
- Export/import generated POIs
- Prompt history
- Custom AI model configurations
- Image generation for POIs

## Support

For issues with:
- **AI Generation**: Check this guide first
- **OpenRouter**: Visit [OpenRouter Docs](https://openrouter.ai/docs)
- **Application Bugs**: Report on GitHub issues

---

Last updated: 2025-11-01
