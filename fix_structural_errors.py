import re

file_path = r'c:\Users\psw71\.gemini\antigravity\scratch\tokyo-flooring\src\data\materials.db.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
fixed_count = 0

# Fix the pattern: category: "NAME, line: "LINE",
# into category: "NAME", line: "LINE",
# Actually, the problem is more generalized: property: "value, nextProperty: "Value",
# But wait, some values naturally have commas? 
# In this file, it's mostly property names like brand:, category:, line:, code: etc.

for line in lines:
    original_line = line
    # Find patterns like category: "LX, line: "
    # We look for a comma followed by a space and a known property name and a colon and a space and a quote
    # Property names in this file: id, brand, category, line, code, name, type, patternGroup, sizeLabel, thickness, width, length, box_pcs, box_m2, price
    
    properties = ['brand', 'category', 'line', 'code', 'name', 'type', 'patternGroup', 'sizeLabel', 'thickness', 'width', 'length', 'box_pcs', 'box_m2', 'price']
    
    for prop in properties:
        # If we see: , prop: " inside a string (between quotes)
        # We want to close the string before it.
        # This is tricky because we need to know where we are inside a string.
        
        # Simple fix for the observed pattern:
        # category: "LX, line: "
        if f', {prop}: "' in line:
            # Check if there's a missing quote before the comma
            # We assume a property value should have ended before the comma.
            # Replace ", {prop}: "" with "", {prop}: ""
            # But only if the prop: start doesn't have a quote before it in the same "segment"
            
            # Let's try more specific: replace ', ' + prop + ': "' with '", ' + prop + ': "'
            # But wait, what if it was already correct?
            # Correct: category: "Deco", line: "Plus"
            # Incorrect: category: "Deco, line: "Plus"
            
            p = f', {prop}: "'
            if p in line and f'"{p}' not in line:
                # Check for things like category: "LX, line: "
                # We want to insert " before ,
                line = line.replace(p, f'", {prop}: "')
                fixed_count += 1

    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Fixed {fixed_count} insertions.")
