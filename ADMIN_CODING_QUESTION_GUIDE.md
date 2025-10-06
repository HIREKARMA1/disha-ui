# Admin Guide: Adding Coding Questions with Test Cases

This guide shows you exactly how to add coding questions as an admin, based on the interface shown in your image.

## 🎯 **Step-by-Step Admin Instructions**

### **Step 1: Access Admin Panel**
1. Login as Admin
2. Go to **Dashboard** → **Practice Module Management**
3. Click **"Create New Question"** or **"Add Question"**

### **Step 2: Create Coding Question**
1. **Question Type**: Select **"Coding"**
2. **Question Statement**: Use this exact format:
   ```html
   <h3>Add Two Numbers</h3>
   <p>Write a function that takes two integers as input and returns their sum.</p>
   <p><strong>Input Format:</strong> Two space-separated integers on a single line.</p>
   <p><strong>Output Format:</strong> Print the sum of the two numbers.</p>
   ```
3. **Difficulty**: Select **"Medium"** (as shown in your image)
4. **Role**: Select **"Developer"**
5. **Tags**: Add `["programming", "math", "basic"]`

### **Step 3: Add Test Cases (Critical Format)**

Based on your image, here's the **EXACT** format to use:

#### **Test Case 1:**
- **Input Data**: `"1 2"` ⚠️ **Space-separated, NOT comma-separated**
- **Expected Output**: `"3"`
- **Points**: `1`
- **Is Hidden**: `false` (visible to students)
- **Order**: `0`

#### **Test Case 2:**
- **Input Data**: `"3 7"`
- **Expected Output**: `"10"`
- **Points**: `1`
- **Is Hidden**: `false` (visible to students)
- **Order**: `1`

#### **Additional Hidden Test Cases:**
- **Input Data**: `"10 20"`
- **Expected Output**: `"30"`
- **Points**: `2`
- **Is Hidden**: `true` (hidden from students)
- **Order**: `2`

### **Step 4: Expected Student Code Format**

Students should write code exactly like this:
```python
def add_two_numbers(a, b):
    return a + b

# Read input from stdin
line = input()
a, b = map(int, line.split())
result = add_two_numbers(a, b)
print(result)
```

## 🔧 **Test Case Format Rules**

### **✅ Correct Input Formats:**
- **Single line with space**: `"1 2"` ✅
- **Multi-line**: `"3\n1 2 3"` ✅
- **String input**: `"hello world"` ✅

### **❌ Wrong Input Formats:**
- **Comma-separated**: `"1,2"` ❌
- **Array format**: `"[1, 2]"` ❌

### **✅ Correct Output Formats:**
- **Exact string match**: `"3"` ✅
- **Case-sensitive**: `"YES"` not `"yes"` ✅

## 🎮 **How the IDE Works (Mock Test Functionality)**

### **1. Question Display**
- Students see the question statement
- **Test Cases (2)** section shows visible test cases
- Each test case shows: Input, Expected Output, Points

### **2. Code Editor**
- Students write code in the editor
- Language selector (Python, JavaScript, Java, C++)
- **Run Button**: Executes code and shows raw output
- **Test Button**: Validates against ALL test cases

### **3. Test Case Validation**
When student clicks **"Test"**:
1. Code is sent to backend validation endpoint
2. Backend runs code against each test case
3. Results are displayed in `TestCasesDisplay.tsx`:
   - ✅ **Passed** or ❌ **Failed** for each test case
   - Shows **Input**, **Expected Output**, **Actual Output**
   - Color-coded: Green for pass, Red for fail

### **4. Submission and Scoring**
When student clicks **"Submit Solution"**:
1. Final code is submitted to backend
2. Backend re-evaluates against ALL test cases
3. **Scoring Rule**: Question is correct ONLY if ALL test cases pass
4. Results displayed in status section:
   - **Marks: X/Y** (e.g., "Marks: 6/6" if all passed)
   - **Result: Correct** or **Incorrect**

## 📊 **Test Case Management Best Practices**

### **Visible Test Cases (60-70% of points):**
- Basic functionality tests
- Edge cases students can see
- 1-2 points each

### **Hidden Test Cases (30-40% of points):**
- Complex scenarios
- Performance tests
- 2-3 points each

### **Points Distribution Example:**
```
Test Case 1: 1 point (visible) - Basic case
Test Case 2: 1 point (visible) - Basic case  
Test Case 3: 2 points (hidden) - Edge case
Test Case 4: 2 points (hidden) - Complex case
Total: 6 points
```

## 🚀 **Quick Test Case Templates**

### **Template 1: Math Operations**
```json
{
  "input_data": "5 3",
  "expected_output": "8",
  "is_hidden": false,
  "points": 1,
  "order": 0
}
```

### **Template 2: Array Processing**
```json
{
  "input_data": "3\n1 2 3",
  "expected_output": "6",
  "is_hidden": false,
  "points": 1,
  "order": 0
}
```

### **Template 3: String Operations**
```json
{
  "input_data": "hello",
  "expected_output": "HELLO",
  "is_hidden": false,
  "points": 1,
  "order": 0
}
```

## ⚠️ **Common Mistakes to Avoid**

1. **Wrong Input Format**: Using `"1,2"` instead of `"1 2"`
2. **Case Sensitivity**: `"yes"` vs `"YES"` in expected output
3. **Whitespace**: Extra spaces in expected output
4. **Missing Hidden Cases**: Not adding hidden test cases for thorough testing
5. **Point Distribution**: Not balancing visible vs hidden test cases

## 🎯 **Result**

Following this guide will create coding questions that work perfectly with your IDE interface, providing students with:
- Clear test case visibility
- Real-time validation feedback
- Proper mock test functionality
- Accurate scoring based on test case results

The `TestCasesDisplay.tsx` component will show results exactly like your image, with pass/fail indicators and detailed input/output comparison! 🎉
