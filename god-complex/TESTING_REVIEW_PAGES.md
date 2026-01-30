# Review Pages Testing Script

## Manual Testing Steps

### Prerequisites
1. Ensure backend server is running on port 4000
2. Ensure Next.js dev server is running
3. Have at least one group with historical data
4. Be logged in to the application

### Test Weekly Review Page

**Navigate to**: `/weekly-review`

#### Test Case 1: Normal Week with Data
**Expected**:
- ✅ Page loads without errors
- ✅ Current week range displayed (e.g., "JAN 15 – JAN 21")
- ✅ Week number shown (e.g., "WEEK 3")
- ✅ Daily breakdown table shows 7 days (MON-SUN)
- ✅ Each day shows accurate goal counts
- ✅ Status badges reflect actual completion
- ✅ Verdict calculated correctly:
  - STABLE: 0-1 failures (blue)
  - UNSTABLE: 2-4 failures (gray)
  - FAILED: 5+ failures (red)

#### Test Case 2: First Week (Partial Data)
**Setup**: Select current week with only 2-3 days completed
**Expected**:
- ✅ Days without data show 0 goals
- ✅ Verdict based only on completed days

#### Test Case 3: Empty State
**Setup**: Select a future week with no data
**Expected**:
- ✅ Shows "No data available for current week" message
- ✅ Shows helper text "Complete at least one day to see weekly review"

#### Test Case 4: Loading State
**Setup**: Slow network or large dataset
**Expected**:
- ✅ Shows "Loading weekly review..." message

#### Test Case 5: Error State
**Setup**: Backend unavailable or network error
**Expected**:
- ✅ Shows "Failed to load weekly data" message in red

---

### Test Monthly Review Page

**Navigate to**: `/monthly-review`

#### Test Case 1: Closed Month with Data
**Expected**:
- ✅ Page loads without errors
- ✅ Month name and year displayed (e.g., "JANUARY 2026")
- ✅ Cycle status shows "CLOSED"
- ✅ Verdict stamp shows CONSISTENT or FAILED
- ✅ Stats grid shows accurate numbers:
  - Total days (28-31)
  - Compliant days
  - Failed days
  - Auto-fails
- ✅ Efficiency percentage calculated correctly
- ✅ Failure threshold section visible if month failed
- ✅ Failure day number shown (e.g., "Day 18")
- ✅ Remaining days calculated correctly

#### Test Case 2: Closed Month (Passed)
**Setup**: Month with finalScore >= 80
**Expected**:
- ✅ Verdict = "CONSISTENT" (blue)
- ✅ No failure threshold section shown (or shows null)
- ✅ Stats show high efficiency

#### Test Case 3: Month In Progress
**Setup**: Current month not yet closed
**Expected**:
- ✅ Shows "Month In Progress" container
- ✅ Shows message about availability after month closes
- ✅ Shows current stats in 3-column grid:
  - Compliant days
  - Failed days
  - Current efficiency %
- ✅ No verdict stamp or failure threshold shown

#### Test Case 4: Loading State
**Setup**: Slow network
**Expected**:
- ✅ Shows "Loading monthly review..." message

#### Test Case 5: Error State
**Setup**: Backend unavailable
**Expected**:
- ✅ Shows "Failed to load monthly data" message in red

---

## API Verification

### Check Network Requests (DevTools)

#### Weekly Review
1. Open Network tab
2. Navigate to `/weekly-review`
3. Verify requests:
   - ✅ `GET /api/history/:groupId/:month` (200 OK)
   - ✅ `GET /api/metrics/:groupId` (200 OK)
4. Check response data structure:
   - History: Array of daily records with goals[]
   - Metrics: Contains patterns, trends

#### Monthly Review
1. Open Network tab
2. Navigate to `/monthly-review`
3. Verify requests:
   - ✅ `GET /api/history/:groupId/:month` (200 OK)
   - ✅ `GET /api/monthly/:groupId/:month` (200 or 404)
4. Check response data:
   - If 200: Contains userOutcome with finalScore, rank, etc.
   - If 404: Month not closed (shows "In Progress" UI)

---

## Edge Cases Testing

### Weekly Review Edge Cases

#### Edge Case 1: Week Spanning Two Months
**Setup**: Test during last week of month
**Expected**:
- ✅ Week range may show days from next month
- ✅ All 7 days processed correctly

#### Edge Case 2: Sunday as Current Day
**Setup**: Test on a Sunday
**Expected**:
- ✅ Week range includes current Sunday
- ✅ Week starts on previous Monday

#### Edge Case 3: No Group Selected
**Setup**: Multi-group mode, no selection
**Expected**:
- ✅ Shows empty state or redirects

### Monthly Review Edge Cases

#### Edge Case 1: February (28/29 days)
**Setup**: View February review
**Expected**:
- ✅ Total days = 28 or 29 (leap year)
- ✅ Calculations correct

#### Edge Case 2: Month with 31 Days
**Setup**: View January/March/May review
**Expected**:
- ✅ Total days = 31
- ✅ All days counted

#### Edge Case 3: First Day of Month
**Setup**: View on day 1
**Expected**:
- ✅ Shows "Month In Progress"
- ✅ Stats show 1 or 0 days

---

## Multi-Group Context Testing

### Test Group Switching

1. Navigate to `/weekly-review`
2. Note current week data
3. Switch group using GroupSelector
4. **Expected**:
   - ✅ Page reloads with new group's data
   - ✅ Week range stays same
   - ✅ Daily breakdown reflects new group

5. Navigate to `/monthly-review`
6. Switch group
7. **Expected**:
   - ✅ Page reloads with new group's data
   - ✅ Month stays same
   - ✅ Stats reflect new group

### Test Month Navigation

1. Navigate to `/weekly-review`
2. Change month using MonthPicker
3. **Expected**:
   - ✅ Week range updates to selected month
   - ✅ Daily breakdown updates

4. Navigate to `/monthly-review`
5. Change month
6. **Expected**:
   - ✅ Month name updates
   - ✅ Stats recalculate for new month

---

## Console Error Check

### No Console Errors Expected
- ✅ No React hydration errors
- ✅ No API 500 errors
- ✅ No undefined variable errors
- ✅ No key prop warnings

### Expected Console Messages
- API calls logged (if logging enabled)
- 404 on `/api/monthly/:groupId/:month` for unclosed months (this is normal)

---

## Performance Check

### Page Load Time
- ✅ Weekly review loads < 2 seconds
- ✅ Monthly review loads < 2 seconds

### Data Fetching
- ✅ Parallel API calls (history + metrics)
- ✅ No duplicate requests
- ✅ Cached data used when appropriate

---

## Accessibility Check

### Keyboard Navigation
- ✅ Can tab through all elements
- ✅ Focus visible

### Screen Reader
- ✅ Page title announced
- ✅ Status badges readable
- ✅ Data values announced with labels

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## Responsive Design

### Desktop (1920x1080)
- ✅ Layout centered with max-width
- ✅ All content visible

### Tablet (768x1024)
- ✅ Grid adjusts to single column
- ✅ Text remains readable

### Mobile (375x667)
- ✅ All sections stack vertically
- ✅ No horizontal scroll
- ✅ Touch targets adequate size

---

## Final Checklist

Before marking as complete:
- [ ] All test cases passed
- [ ] No console errors
- [ ] API calls verified
- [ ] Edge cases handled
- [ ] Multi-group switching works
- [ ] Loading states shown
- [ ] Error states shown
- [ ] Empty states shown
- [ ] Performance acceptable
- [ ] Responsive on all devices
- [ ] Accessible
- [ ] Browser compatible

---

## Known Limitations

1. **Failure Analysis Section**: Shows placeholder text ("Too Tired / Late")
   - Requires integration with excuse/pattern data
   - Backend API needs to expose pattern analysis

2. **System Judgment**: Shows placeholder text ("Avoidance Escalation")
   - Requires integration with pattern detection
   - Backend API needs to expose judgment text

3. **Week Spanning Months**: Assumes week stays within single month
   - Edge case: Last week of month may show incorrect dates

4. **Financial Data**: Not yet displayed in monthly review
   - payoutAmount and penaltyAmount available in API but not shown in UI
   - Future enhancement needed

---

## Debugging Tips

### If weekly review shows wrong data:
1. Check browser console for API errors
2. Verify `currentMonth` in DashboardContext
3. Check `selectedGroupId` is set
4. Verify history Map keys are YYYY-MM-DD format
5. Check getWeekRange() returns correct dates

### If monthly review shows "In Progress" incorrectly:
1. Check `/api/monthly/:groupId/:month` response
2. Verify `isClosed` flag from useMonthlyOutcome
3. Check backend month closure logic
4. Verify outcome.userOutcome exists

### If verdict is wrong:
1. Check failure count calculation
2. Verify goal.completed boolean values
3. Check isAutoFailed flags
4. Verify verdict thresholds (STABLE: 0-1, UNSTABLE: 2-4, FAILED: 5+)

### If dates are wrong:
1. Check system timezone
2. Verify YYYY-MM format in currentMonth
3. Check Date object construction in getWeekRange
4. Verify getDayName uses correct day-of-week (0-6)
