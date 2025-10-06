# Test Days Remaining Feature

## ✅ **Successfully Added "Days Left to Expire" to Student Practice Cards**

### **What Was Added:**

#### **1. Backend Changes**
- **API Response**: Added `days_remaining` field to student modules endpoint
- **Calculation Logic**: Calculates days between current time and `end_date`
- **Schema Update**: Added `days_remaining: Optional[int] = None` to `PracticeModuleSchema`

#### **2. Frontend Changes**
- **PracticeCard Component**: Added days remaining display in the meta information section
- **TypeScript Types**: Added `days_remaining?: number | null` to `PracticeModule` interface
- **Smart Display**: Shows different messages based on days remaining

### **Display Logic:**

```typescript
{module.days_remaining === 0 
    ? 'Expires Today' 
    : module.days_remaining === 1 
        ? '1 Day Left' 
        : `${module.days_remaining} Days Left`
}
```

### **Visual Layout:**

Each practice card now shows:
```
┌─────────────────────────────────┐
│ Module Title                    │
│ Admin Practice Test             │
│                                 │
│ ⏱️ 1h 0m                       │
│ 🎯 5 Questions                  │
│ 📚 Developer                    │
│ 🧠 Available                    │
│ ⏰ 3 Days Left ← NEW            │
│                                 │
│ [View Details] [Start Practice] │
└─────────────────────────────────┘
```

### **Backend Calculation:**

```python
# Calculate days remaining until expiration
days_remaining = None
if module.end_date:
    end_date = module.end_date.replace(tzinfo=None) if module.end_date.tzinfo else module.end_date
    current_naive = current_time.replace(tzinfo=None)
    
    if end_date > current_naive:
        time_diff = end_date - current_naive
        days_remaining = max(0, time_diff.days)
    else:
        days_remaining = 0  # Expired
```

### **Example Scenarios:**

#### **✅ Module with 5 days left:**
- Shows: "5 Days Left"
- Icon: Clock

#### **✅ Module expiring tomorrow:**
- Shows: "1 Day Left" 
- Icon: Clock

#### **✅ Module expiring today:**
- Shows: "Expires Today"
- Icon: Clock

#### **✅ Module with no end date:**
- Shows: Nothing (no expiration info)
- Always available

#### **✅ Expired module:**
- Shows: "Expires Today" (days_remaining = 0)
- Should be filtered out by backend

### **How to Test:**

1. **Create a practice module** with an end date (using admin panel)
2. **Go to student panel** → Practice Tests
3. **Look for the clock icon** and days remaining text
4. **Verify the countdown** decreases each day

### **Integration Points:**

- **Admin Module Creation**: Set start/end dates when creating modules
- **Student View**: See expiration countdown on practice cards
- **Backend Filtering**: Expired modules are automatically hidden from students

## 🎉 **Ready to Use!**

Students will now see exactly how many days are left before each practice test expires, helping them prioritize which tests to take first!
