# AI POI Generation - Quick Start Guide

Get started with AI-powered POI generation in 5 minutes.

## Prerequisites

✅ Navigame Admin installed and running
✅ Firebase configured
✅ At least one Country, City, and Category created

## Setup (One-Time)

### 1. Create OpenRouter Account

Visit [openrouter.ai](https://openrouter.ai/) and sign up (free).

### 2. Get API Key

1. Log in to OpenRouter
2. Click **Keys** in sidebar
3. Click **Create Key**
4. Copy the key (starts with `sk-or-v1-`)

### 3. Add to Environment

Edit `.env.local` and add:

```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-paste-your-key-here
```

### 4. Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

### 5. Add Credits (Optional but Recommended)

1. Go to **Credits** in OpenRouter
2. Add $5 for testing (goes a long way!)

## Usage

### Quick Test

1. Navigate to **AI Generate** (🤖 in sidebar)
2. Select **Gemini Pro 1.5** (cost-effective)
3. Enter this prompt:
   ```
   Popular tourist attractions with historical significance
   ```
4. Select your Country, City, and Category
5. Set to **5 POIs**
6. Click **Generate POIs**
7. Wait 10-20 seconds
8. Review and click **Import All**

Done! Check your POIs page.

## Sample Prompts

### Restaurants
```
Family-friendly restaurants with outdoor seating and kids menus.
Include casual dining options with reasonable prices under $30 per person.
```

### Hotels
```
Boutique hotels in the city center with unique architectural features.
Focus on 4-star properties with rooftop bars or terraces.
```

### Museums
```
Art museums featuring contemporary and modern works.
Include galleries with rotating exhibitions and interactive displays.
```

### Shopping
```
Local artisan shops selling handmade crafts and souvenirs.
Include stores with unique local products and fair trade items.
```

## Adding Dynamic Fields

In the "Dynamic Fields" input, add comma-separated field names:

```
phone, website, opening_hours
```

The AI will generate realistic values for each field.

## Best Practices

### ✅ DO
- Start with 5 POIs to test
- Be specific in prompts
- Review before importing
- Use cheaper models for simple lists
- Mention price ranges, atmosphere

### ❌ DON'T
- Generate 50 POIs on first try
- Use vague prompts like "nice places"
- Import without reviewing
- Forget to add credits to OpenRouter
- Expect 100% accuracy (it's AI)

## Model Recommendations

| Use Case | Model | Why |
|----------|-------|-----|
| Testing | Gemini Pro 1.5 | Fast and cheap |
| Quality | Claude 3.5 Sonnet | Best results |
| Bulk | Llama 3.1 70B | Most cost-effective |
| Balanced | GPT-4 Turbo | Good speed/quality |

## Cost Guide

- **5 POIs**: $0.01-0.03 (about 1 cent)
- **20 POIs**: $0.03-0.10 (about 5 cents)
- **$5 credit**: ~500-1000 POIs

## Common Issues

### "No response from AI"
**Solution**: Check API key in `.env.local` and restart dev server

### "Failed to fetch models"
**Solution**: Check internet connection and API key validity

### Low quality results
**Solution**: Make prompt more specific, try Claude or GPT-4

### Rate limiting
**Solution**: Wait 30 seconds or reduce POIs per request

## Examples by Category

### Tourist Attractions
```
Famous landmarks and monuments with guided tour options.
Include UNESCO World Heritage sites and places with audio guides available.
Focus on top-rated attractions from travel guides.
```

### Restaurants - Fine Dining
```
Upscale restaurants with tasting menus and wine pairings.
Include Michelin-starred or equivalent establishments.
Focus on innovative cuisine and elegant atmosphere.
```

### Hotels - Budget
```
Clean and safe budget accommodations near public transit.
Include hostels, guesthouses, and budget hotels under $50/night.
Prioritize locations with good reviews and security.
```

### Nightlife
```
Popular bars and nightclubs with live music or DJs.
Include venues with dance floors and cocktail bars.
Focus on places popular with locals and tourists.
```

## Workflow Example

**Task**: Add 20 restaurants to Paris

1. **Batch 1** - Fine Dining (5 POIs)
   - Model: Claude 3.5 Sonnet
   - Prompt: "Michelin-starred restaurants with tasting menus"
   - Fields: phone, website, price_range, dress_code

2. **Batch 2** - Casual (10 POIs)
   - Model: Gemini Pro
   - Prompt: "Casual bistros and cafes with outdoor seating"
   - Fields: phone, website, outdoor_seating

3. **Batch 3** - Ethnic (5 POIs)
   - Model: Gemini Pro
   - Prompt: "Authentic ethnic restaurants (Italian, Asian, Middle Eastern)"
   - Fields: phone, website, cuisine_type

**Total time**: ~5 minutes
**Total cost**: ~$0.15

## Next Steps

- Read the full [AI Generation Guide](AI_GENERATION.md)
- Experiment with different models
- Try complex prompts with multiple requirements
- Generate POIs for multiple cities
- Combine with manual editing for perfect results

## Getting Help

- **Setup issues**: See [SETUP.md](SETUP.md)
- **Usage questions**: See [AI_GENERATION.md](AI_GENERATION.md)
- **API issues**: Visit [OpenRouter Docs](https://openrouter.ai/docs)

---

**Remember**: AI generates realistic-sounding data, but always review before importing important POIs!
