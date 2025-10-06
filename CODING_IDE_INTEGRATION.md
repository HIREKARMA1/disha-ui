# Coding IDE Integration - LeetCode Style

## 🎯 **Overview**
Successfully integrated a full-featured coding IDE into the practice exam system, similar to LeetCode and GeeksforGeeks platforms.

## ✨ **Features Implemented**

### **🔧 IDE Features:**
- ✅ **Monaco Editor**: Full VS Code-like editor with syntax highlighting
- ✅ **Language Support**: Python, Java, C++, JavaScript
- ✅ **Syntax Highlighting**: Real-time syntax highlighting for all languages
- ✅ **Auto-completion**: Built-in IntelliSense
- ✅ **Code Formatting**: Auto-format code with keyboard shortcut
- ✅ **Line Numbers**: Clear line numbering for easy debugging
- ✅ **Bracket Matching**: Visual bracket pair colorization
- ✅ **Dark Theme**: Professional dark theme for coding

### **🚀 Execution Features:**
- ✅ **Test Run**: Execute code and see output instantly
- ✅ **Input Support**: Optional input field for programs
- ✅ **Output Console**: Real-time stdout/stderr display
- ✅ **Runtime Metrics**: Execution time and memory usage
- ✅ **Error Handling**: Clear error messages and debugging info

### **💾 File Operations:**
- ✅ **Save Code**: Download code as file
- ✅ **Reset Code**: Reset to default template
- ✅ **Language Switching**: Change language with auto-template update
- ✅ **Code Persistence**: Maintain code across language switches

### **📊 User Experience:**
- ✅ **Change Tracking**: Shows when code has unsaved changes
- ✅ **Submission Status**: Clear feedback on submission state
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Keyboard Shortcuts**: Standard IDE shortcuts
- ✅ **Loading States**: Smooth loading indicators

## 🎨 **UI/UX Design**

### **Header Section:**
```
┌─────────────────────────────────────────────────────────┐
│ Code Editor                    [Python ▼] [⚙️] [🔄] [💾] [▶️] │
└─────────────────────────────────────────────────────────┘
```

### **Editor Section:**
```
┌─────────────────────────────────────────────────────────┐
│ 1  def add_two_numbers(a, b):                          │
│ 2      return a + b                                     │
│ 3                                                        │
│ 4  print(add_two_numbers(5, 3))                         │
│ 5                                                        │
└─────────────────────────────────────────────────────────┘
```

### **Input/Output Section:**
```
┌─────────────────────────────────────────────────────────┐
│ Input (Optional)                            [▼]         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │                                                     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Test Output                                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ STDOUT: 8                                          │ │
│ │ Runtime: 45.2ms                                    │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### **Status Section:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔄 You have unsaved changes. Click "Submit Solution"   │
│    below to save your work.                             │
└─────────────────────────────────────────────────────────┘
```

## 🔄 **How It Works**

### **1. Student Experience:**
1. **Access Coding Question**: Student opens a coding practice question
2. **Choose Language**: Select from Python, Java, C++, JavaScript
3. **Write Code**: Use full IDE with syntax highlighting and auto-completion
4. **Test Code**: Click "Test Run" to execute and see output
5. **Submit Solution**: Click "Submit Solution" when ready

### **2. Code Execution Flow:**
```
Student Code → Monaco Editor → API Client → Backend → Judge0 API → Results → Display
```

### **3. State Management:**
- **Local State**: Code, language, output, submission status
- **Parent Communication**: Only on submission, not on every keystroke
- **Change Tracking**: Visual indicators for unsaved changes

## 📁 **File Structure**

```
disha-ui/
├── components/
│   └── practice/
│       ├── CodingIDE.tsx          # Main IDE component
│       └── OptionsPanel.tsx       # Updated to use CodingIDE
├── lib/
│   └── api.ts                     # API client with coding endpoints
└── types/
    └── practice.ts                # TypeScript types for coding questions

disha-server/
├── app/api/v1/
│   ├── endpoints/
│   │   └── coding_practice.py     # Coding execution API
│   └── api.py                     # Updated with coding routes
└── app/core/
    └── config.py                  # Judge0 API configuration
```

## 🚀 **Setup Instructions**

### **1. Backend Setup:**
```bash
cd disha-server

# Add to .env file:
JUDGE0_API_KEY=your-judge0-api-key-here
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com

# Start backend
python main.py
```

### **2. Frontend Setup:**
```bash
cd disha-ui

# Install dependencies (already installed)
npm install

# Start frontend
npm run dev
```

### **3. Test the IDE:**
1. Go to Practice → Create coding question
2. Select "coding" question type
3. Start practice exam
4. See full IDE interface

## 🎯 **Usage Examples**

### **Creating a Coding Question:**
```typescript
// Admin creates coding question
{
  statement: "Write a function to add two numbers",
  type: "coding",
  expected_output: "8",
  test_cases: "addTwoNumbers(3, 5) → 8\naddTwoNumbers(10, 20) → 30"
}
```

### **Student Coding Experience:**
```python
# Student writes code in IDE
def add_two_numbers(a, b):
    return a + b

# Test run shows: STDOUT: 8
print(add_two_numbers(5, 3))
```

## 🔧 **Technical Implementation**

### **Monaco Editor Integration:**
```tsx
<MonacoEditor
    height="100%"
    language={selectedLanguage}
    value={code}
    onChange={handleEditorChange}
    theme="vs-dark"
    options={{
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'on',
        bracketPairColorization: { enabled: true }
    }}
/>
```

### **Language Templates:**
```typescript
const LANGUAGES = [
    { 
        id: 'python', 
        label: 'Python', 
        defaultCode: 'def add_two_numbers(a, b):\n    return a + b' 
    },
    // ... other languages
]
```

### **API Integration:**
```typescript
const result = await apiClient.executeCodingCode({
    code: code,
    language: selectedLanguage.id,
    input: input,
    question_id: questionId
})
```

## 🎉 **Result**

The coding IDE is now fully integrated and provides a professional coding experience similar to:

- ✅ **LeetCode**: Syntax highlighting, test cases, execution
- ✅ **GeeksforGeeks**: Language selection, code formatting
- ✅ **HackerRank**: Real-time execution, output display
- ✅ **CodeChef**: Professional IDE interface

Students can now:
- Write code with full IDE features
- Test their solutions instantly
- Submit professional-quality code
- Experience a modern coding platform

The integration is complete and ready for production use! 🚀
