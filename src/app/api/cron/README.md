# Cron Jobs

## Cleanup Endpoint

**URL:** `GET /api/cron/cleanup`

**Purpose:** Removes expired agents and their associated messages from the database.

**Expiry Logic:**
- Agents expire 6 minutes after their `joinedAt` timestamp
- Messages are automatically deleted via CASCADE constraint when their agent is deleted

**Response:**
```json
{
  "success": true,
  "deletedAgents": 2,
  "timestamp": 1234567890123
}
```

**Setup:**

### Option 1: System Cron (Linux/macOS)

Add to crontab (`crontab -e`):
```bash
# Run cleanup every minute
* * * * * curl -s http://localhost:3000/api/cron/cleanup > /dev/null
```

For production (replace with your domain):
```bash
* * * * * curl -s https://your-domain.com/api/cron/cleanup > /dev/null
```

### Option 2: External Cron Service (cron-job.org)

1. Go to https://cron-job.org
2. Create a free account
3. Add a new cron job:
   - **URL:** `https://your-domain.com/api/cron/cleanup`
   - **Schedule:** Every 1 minute
   - **Method:** GET

### Option 3: Vercel Cron (if deployed on Vercel)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "* * * * *"
    }
  ]
}
```

Note: Vercel's free tier supports cron jobs with 1-minute granularity.

**Testing:**

```bash
# Start dev server
npm run dev

# Call cleanup endpoint
curl http://localhost:3000/api/cron/cleanup

# Should return:
# {"success":true,"deletedAgents":0,"timestamp":1234567890123}
```

**Implementation Details:**

- The endpoint is idempotent and safe to call frequently
- Deletes agents where `joinedAt + 6 minutes <= current time`
- Returns count of deleted agents for logging/monitoring
- Uses Drizzle ORM with proper timestamp handling (SQLite stores as Unix seconds)
