# Review Pages API Integration - Implementation Summary

## Overview
Successfully replaced mock data in weekly and monthly review pages with real API integration, creating a complete data flow from backend services to frontend UI.

## Files Created

### 1. `/apps/web/src/lib/dateUtils.ts`
**Purpose**: Date calculation utilities for review pages

**Functions**:
- `getWeekRange(date: Date)`: Calculate Monday-Sunday boundaries for a given date
  - Returns: `{ start: Date, end: Date }`
  - Handles Sunday correctly (day 0)
  
- `getDayName(dayOfWeek: number)`: Convert day number (0-6) to abbreviation
  - Returns: "SUN", "MON", "TUE", etc.
  
- `getWeekNumber(date: Date)`: Calculate week number within month (1-5)
  
- `getDaysInMonth(month: string)`: Get total days in YYYY-MM format month
  - Example: "2024-02" → 29 (leap year)
  
- `calculateFailureThresholdDay(history, totalDays, requiredScore, maxDailyScore)`: Find day when failure became irreversible
  - Works with Map<string, any> (YYYY-MM-DD keys)
  - Returns: day number or null if recovery still possible
  - Calculates cumulative score and checks if remaining days can reach required score
  
- `formatDateRange(startDay, endDay, month)`: Format as "JAN 15 – JAN 21"
  
- `formatMonth(month)`: Format as "JANUARY 2026"

### 2. `/apps/web/src/hooks/useMonthlyOutcome.ts`
**Purpose**: Fetch monthly outcome data (final scores, payouts, penalties)

**Interfaces**:
```typescript
interface UserOutcome {
  userId: string;
  finalScore: number;
  rank: number;
  averageDailyScore: number;
  activeDays: number;
  payoutAmount: number;
  penaltyAmount: number;
}

interface MonthlyOutcome {
  groupId: string;
  month: string;
  userOutcome: UserOutcome;
}
```

**API Endpoint**: `/api/monthly/${groupId}/${currentMonth}`

**Features**:
- Handles 404 status for unclosed months (sets `isClosed = false`)
- Returns loading, error, and outcome states
- Automatically uses groupId and currentMonth from DashboardContext

**Returns**:
```typescript
{
  outcome: MonthlyOutcome | null,
  loading: boolean,
  error: string | null,
  isClosed: boolean
}
```

## Files Updated

### 3. `/apps/web/src/app/(system)/weekly-review/page.tsx`
**Changes**: Replaced all mock data with real API integration

**Data Sources**:
- `useMonthlyHistory(selectedGroupId, currentMonth)` - daily history data
- `useDashboardMetrics(selectedGroupId)` - metrics data
- `useDashboardContext()` - selected group and month
- `dateUtils` - date calculations

**Logic Implemented**:

1. **Week Calculation**:
   - Get current week's Monday-Sunday range
   - Format as "JAN 15 – JAN 21"
   - Calculate week number (e.g., "WEEK 3")

2. **Daily Breakdown**:
   - Iterate through 7 days of current week
   - For each day, fetch from history Map using YYYY-MM-DD key
   - Calculate: total goals, completed, failed
   - Determine status: COMPLIANT, FAILED, or AUTO_FAILED
   - Build DailyBreakdown array

3. **Verdict Calculation**:
   - Count total failures (including auto-fails)
   - STABLE: 0-1 failures
   - UNSTABLE: 2-4 failures
   - FAILED: 5+ failures

4. **States Handled**:
   - **Loading**: Shows "Loading weekly review..." message
   - **Error**: Shows "Failed to load weekly data" message
   - **Empty**: Shows "No data available for current week" if all days have 0 goals

**UI Preserved**:
- Verdict stamp with color coding
- System judgment section
- Failure analysis sidebar
- Evidence log table with daily breakdown
- All original styling and animations

### 4. `/apps/web/src/app/(system)/monthly-review/page.tsx`
**Changes**: Replaced all mock data with real API integration

**Data Sources**:
- `useMonthlyHistory(selectedGroupId, currentMonth)` - daily history data
- `useMonthlyOutcome()` - monthly outcome from backend
- `useDashboardContext()` - selected group and month
- `dateUtils` - date calculations

**Logic Implemented**:

1. **Month Stats Calculation**:
   - Iterate through all history entries
   - Count: compliant days, failed days, auto-fails
   - Calculate efficiency: (compliant / total) * 100

2. **Verdict Determination**:
   - If month is closed and outcome exists:
     - CONSISTENT: finalScore >= 80
     - FAILED: finalScore < 80
   - If month not closed: verdict = "FAILED" (default)

3. **Failure Threshold**:
   - Only calculated if month is closed
   - Uses `calculateFailureThresholdDay()` utility
   - Shows day when recovery became impossible
   - Calculates remaining days after threshold

4. **States Handled**:
   - **Loading**: Shows "Loading monthly review..." message
   - **Error**: Shows "Failed to load monthly data" message
   - **In Progress**: Shows "Month In Progress" screen with:
     - Current stats (compliant, failed, efficiency)
     - Message: "Monthly review will be available after [MONTH] closes"
   - **Closed**: Shows full review with verdict and failure threshold

**UI Preserved**:
- Verdict stamp with color coding
- Failure threshold report (conditional)
- Month summary grid with stats
- System conclusion section
- Archival notice
- All original styling

## Testing Checklist

### Weekly Review Page
- [ ] Page loads without errors
- [ ] Shows loading state while fetching data
- [ ] Displays current week range correctly (MON-SUN)
- [ ] Week number calculated correctly
- [ ] Daily breakdown shows accurate goal counts
- [ ] Status badges reflect actual completion status
- [ ] Verdict calculated correctly based on failure count:
  - [ ] STABLE: 0-1 failures
  - [ ] UNSTABLE: 2-4 failures
  - [ ] FAILED: 5+ failures
- [ ] Empty state shown when no data available
- [ ] Error state shown on API failure

### Monthly Review Page
- [ ] Page loads without errors
- [ ] Shows loading state while fetching data
- [ ] Displays correct month name and year
- [ ] Stats calculated accurately:
  - [ ] Total days in month
  - [ ] Compliant days count
  - [ ] Failed days count
  - [ ] Auto-fail count
  - [ ] Efficiency percentage
- [ ] Verdict determined correctly:
  - [ ] CONSISTENT when finalScore >= 80
  - [ ] FAILED when finalScore < 80
- [ ] Failure threshold day calculated and displayed (closed months only)
- [ ] "Month In Progress" state shown for unclosed months
- [ ] Error state shown on API failure

### Edge Cases
- [ ] First week of month (partial week)
- [ ] Week spanning two months
- [ ] Month with 28 days (February)
- [ ] Month with 31 days
- [ ] Leap year handling
- [ ] Sunday as first day of week
- [ ] No group selected (should show empty state)
- [ ] No history data available
- [ ] Month closed with no outcome data

### Integration Tests
- [ ] Weekly review updates when month changes
- [ ] Monthly review updates when group changes
- [ ] Data syncs across both pages
- [ ] Navigation between weekly/monthly review works
- [ ] Multi-group context switching works correctly

## API Dependencies

### Backend Endpoints Used
1. `/api/history/:groupId/:month` - Daily history data
2. `/api/monthly/:groupId/:month` - Monthly outcome data
3. `/api/metrics/:groupId` - Dashboard metrics

### Data Models
- **History Map**: `Map<string, DayData>` with YYYY-MM-DD keys
- **DayData**: Contains `goals[]`, `isAutoFailed` flag
- **Goal**: Contains `completed` boolean
- **MonthlyOutcome**: Contains `userOutcome` with scores and financial data

## Known Issues & Limitations

1. **Linting Warning**: `bg-gradient-to-b` suggested to use `bg-linear-to-b` (not critical)
2. **Week Spanning Months**: Currently assumes week stays within single month
3. **Failure Analysis Section**: Still shows placeholder text ("Too Tired / Late") - needs integration with excuse/pattern data
4. **System Judgment Text**: Still shows placeholder text ("Avoidance Escalation") - needs integration with pattern detection

## Future Enhancements

1. **Weekly Review**:
   - Integrate excuse patterns from metrics API
   - Show primary excuse for failed days
   - Add momentum indicator from metrics
   - Add hover tooltips on daily breakdown with goal details

2. **Monthly Review**:
   - Display actual system conclusion from pattern detection
   - Show payout/penalty amounts from outcome
   - Add month-over-month comparison
   - Show ranking within group

3. **Both Pages**:
   - Add export/print functionality
   - Add share/screenshot feature
   - Show historical review archive (previous weeks/months)
   - Add charts/visualizations for trends

## Files Modified Summary

### Created
- `/apps/web/src/lib/dateUtils.ts` (107 lines)
- `/apps/web/src/hooks/useMonthlyOutcome.ts` (43 lines)

### Updated
- `/apps/web/src/app/(system)/weekly-review/page.tsx` (146 → 222 lines)
- `/apps/web/src/app/(system)/monthly-review/page.tsx` (125 → 169 lines)

## Implementation Status

✅ **Completed**:
- Date utility functions
- Monthly outcome hook
- Weekly review API integration
- Monthly review API integration
- Loading states
- Error states
- Empty states (first week, unclosed month)
- Verdict calculation logic
- Failure threshold calculation

⏭️ **Pending**:
- Testing all checklist items
- Integration with pattern detection data
- Financial data display (payout/penalty amounts)
- Historical archive feature
