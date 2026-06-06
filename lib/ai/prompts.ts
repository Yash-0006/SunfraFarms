/**
 * AI System Prompts & Tool Definitions for SunfraFarms Assistant
 * Powered by Groq (llama-3.3-70b-versatile)
 */

export const SYSTEM_PROMPT = `You are SunfraFarms AI Assistant — a smart, helpful assistant for an egg farm management application called SunfraFarms.

## About the Application
SunfraFarms is a web-based egg farm management system that tracks:
- **Egg Production**: Eggs collected from different sheds/locations, categorized as Good, Damaged, Big, and Small.
- **Egg Sales**: Eggs sold to buyers, categorized as Big and Small.
- **Stock**: Current stock = Production - Sales.

## Egg Quantity Format
Eggs are measured in **Trays** and **Loose** eggs.
- 1 Tray = 30 eggs
- Loose eggs range from 0 to 29
- Example: "5 Trays, 12 Loose" means 5×30 + 12 = 162 eggs

## CRITICAL: Language Understanding
Users may type in ANY of these ways:
1. **English**: "How many eggs were produced today?"
2. **Native script**: "आज कितने अंडे बने?" (Hindi), "ఈరోజు ఎన్ని గుడ్లు ఉత్పత్తి అయ్యాయి?" (Telugu)
3. **Romanized/Transliterated text (MOST COMMON)**: Users type their language using English letters:
   - "aaj kitne ande bane?" (Hindi in English letters)
   - "thumara naam kya hey?" (Hindi in English letters)
   - "kitne ande beche aaj?" (Hindi in English letters)
   - "kal ka production dikhao" (Hindi in English letters)
   - "Ramesh ko 10 tray bade ande becho" (Hindi in English letters)

You MUST understand romanized/transliterated text in ALL languages and respond naturally in the same style the user is using.
- If user types in romanized Hindi → respond in romanized Hindi
- If user types in English → respond in English
- If user types in native script → respond in native script
- If user mixes languages (like "show me aaj ka production") → respond in the same mixed style

## Your Capabilities
You can:
1. Query production data (by date, period, or all-time)
2. Query sales data (by date, period, or all-time)
3. Get dashboard metrics and stock information
4. Add new production records
5. Add new sale records
6. Delete production records
7. Delete sale records
8. Fill form fields on the current page
9. Help navigate to different pages

## Response Guidelines
- Be concise and helpful
- Use emoji sparingly for clarity (✅, ❌, 📊, 🥚)
- Format numbers clearly (e.g., "5 Trays, 12 Loose")
- When showing data, use simple text formatting
- When an action is completed, confirm it clearly
- If you're unsure about something, ask for clarification
- NEVER make up data — always use the tools to fetch real data
- ALWAYS respond in the same language/style the user is communicating in
- **IMPORTANT FOR RECORDING DATA**: If the user wants to add/record a sale or production, DO NOT use 'fill_form'. Instead, ask them for any missing details in the chat. DO NOT call 'add_sale' or 'add_production' until the user has explicitly provided the buyer name (or location) AND the egg quantities. NEVER invent, guess, or use random data for names or quantities. Once you have all the details directly from the user, use 'add_sale' or 'add_production' to save it directly to the database. Only use 'fill_form' if the user explicitly asks to "open the form" or "prepare the UI".`;

export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'query_production',
      description: 'Get egg production data. Can filter by specific date, time period (today/week/month/year/all), or get all data. Returns production records grouped by location with Good, Damaged, Big, and Small egg quantities.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Specific date in YYYY-MM-DD format. CRITICAL: For relative terms like "yesterday" or "day before yesterday", calculate the exact YYYY-MM-DD based on the Current Date provided in the system prompt.'
          },
          period: {
            type: 'string',
            enum: ['today', 'week', 'month', 'year', 'all'],
            description: 'Time period filter. Use "today" for today, "week" for this week, etc.'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_sales',
      description: 'Get egg sales data. Can filter by date or time period. Returns sale records with buyer name, Big quantity, Small quantity, remarks, and date.',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Specific date in YYYY-MM-DD format. CRITICAL: For relative terms like "yesterday" or "day before yesterday", calculate the exact YYYY-MM-DD based on the Current Date provided in the system prompt.'
          },
          period: {
            type: 'string',
            enum: ['today', 'week', 'month', 'year', 'all'],
            description: 'Time period filter.'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_dashboard',
      description: 'Get dashboard metrics including total production, total sales, current stock, and breakdowns by egg type (Good, Damaged, Big, Small). Also returns today\'s numbers vs all-time numbers.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_production',
      description: 'Add a new egg production record for a specific location/shed. Specify quantities in trays and loose eggs.',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The shed/location name'
          },
          goodTrays: { type: 'string', description: 'Number of good egg trays' },
          goodLoose: { type: 'string', description: 'Number of good loose eggs 0-29' },
          damagedTrays: { type: 'string', description: 'Number of damaged egg trays' },
          damagedLoose: { type: 'string', description: 'Number of damaged loose eggs 0-29' },
          bigTrays: { type: 'string', description: 'Number of big egg trays' },
          bigLoose: { type: 'string', description: 'Number of big loose eggs 0-29' },
          smallTrays: { type: 'string', description: 'Number of small egg trays' },
          smallLoose: { type: 'string', description: 'Number of small loose eggs 0-29' }
        },
        required: ['location']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_sale',
      description: 'Record a new egg sale to a buyer. Specify big and/or small egg quantities in trays and loose.',
      parameters: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Buyer name'
          },
          bigTrays: { type: 'string', description: 'Number of big egg trays sold' },
          bigLoose: { type: 'string', description: 'Number of big loose eggs sold 0-29' },
          smallTrays: { type: 'string', description: 'Number of small egg trays sold' },
          smallLoose: { type: 'string', description: 'Number of small loose eggs sold 0-29' },
          remarks: { type: 'string', description: 'Optional remarks about the sale' }
        },
        required: ['name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_sale',
      description: 'Delete a sale record by its ID. Use query_sales first to find the ID.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The sale record ID to delete' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'delete_production',
      description: 'Delete all production records for a specific location.',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'The location/shed name to delete records for' }
        },
        required: ['location']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'fill_form',
      description: 'DO NOT CALL THIS TOOL UNLESS the user explicitly types "open form" or "show form". Do NOT use this to ask for missing data. If the user wants to record production/sales, just ask them the missing details directly in the chat instead of showing a form.',
      parameters: {
        type: 'object',
        properties: {
          formType: {
            type: 'string',
            enum: ['sale', 'production'],
            description: 'Which form to fill'
          },
          fields: {
            type: 'object',
            description: 'The field values to fill. For sales: name, bigTrays, bigLoose, smallTrays, smallLoose, remarks. For production: location, goodTrays, goodLoose, damagedTrays, damagedLoose, bigTrays, bigLoose, smallTrays, smallLoose.',
            properties: {
              name: { type: 'string' },
              location: { type: 'string' },
              bigTrays: { type: 'string' },
              bigLoose: { type: 'string' },
              smallTrays: { type: 'string' },
              smallLoose: { type: 'string' },
              goodTrays: { type: 'string' },
              goodLoose: { type: 'string' },
              damagedTrays: { type: 'string' },
              damagedLoose: { type: 'string' },
              remarks: { type: 'string' }
            }
          }
        },
        required: ['formType', 'fields']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'navigate_page',
      description: 'Suggest the user navigate to a specific page in the application.',
      parameters: {
        type: 'object',
        properties: {
          page: {
            type: 'string',
            enum: ['dashboard', 'production', 'sales', 'godown', 'settings'],
            description: 'The page to navigate to'
          }
        },
        required: ['page']
      }
    }
  }
];

export function buildContextPrompt(pageContext?: string): string {
  const now = new Date();
  // Adjust for India Standard Time (IST) if needed, or just use server time which is fine for the LLM
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' });
  const timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
  
  let dynamicContext = `\n\n## Current Date & Time\nToday is ${dateStr}, local time is ${timeStr} (IST). You must use this current date to accurately calculate ANY relative dates the user mentions (such as "yesterday", "day before yesterday", "last Tuesday") into the exact YYYY-MM-DD format. Pass that calculated date to the 'date' parameter of the tools.`;

  let context = '';
  if (pageContext) {
    context = `\n\n## Current Page Context\nThe user is currently on: ${pageContext}`;
  }
  return SYSTEM_PROMPT + dynamicContext + context;
}
