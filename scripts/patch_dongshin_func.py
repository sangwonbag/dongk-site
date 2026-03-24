import re

file_path = 'src/data/materials.db.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I want to find the processDongshinItem = (item) => block
# and inside it, change every `category = "..."` to `materialType = "..."`
# and explicitly set `category = "데코타일"` at the top of the function

start_idx = content.find('processDongshinItem = (item) => {')
if start_idx == -1:
    start_idx = content.find('const processDongshinItem = (item) => {')

if start_idx != -1:
    end_idx = content.find('\n};', start_idx) + 3
    if end_idx < 3:
        end_idx = content.find('\n}', start_idx) + 2
    
    func_text = content[start_idx:end_idx]
    
    # 1. Change top declarations: let category = ""; to let materialType = "";
    func_text = func_text.replace('let category = "";', 'let category = "데코타일";\n    let materialType = "";')
    
    # 2. Change assignments like category = "동신 450각"; to materialType = "동신 450각";
    # We'll just replace 'category = ' with 'materialType = ' inside the if-blocks, except for the top declaration wrapper
    # Actually, a regex replace inside the function body is safer:
    func_text = re.sub(r'(\s+)category(\s*=\s*"[^"]+");', r'\1materialType\2;', func_text)
    
    # Re-enforce the top declaration just in case it got hit
    func_text = func_text.replace('let materialType = "데코타일";', 'let category = "데코타일";')
    
    # Add category and materialType to the returned object
    # return { ...item, price, specs: { size: sizeLabel, packing }, subCategory: category, materialType: type };
    # We change it to:
    # return { ...item, price, category, materialType, specs: { size: sizeLabel, packing } };
    
    # Wait, let's see what it returns right now.
    print("Function before return change:")
    print(func_text[-300:])
    
    # Simple replace on return statement:
    if 'return {' in func_text:
        # We can just inject category, materialType, into the return block
        func_text = re.sub(r'(return\s*\{\s*\.\.\.item,\s*)([^}]+)(\s*\})', r'\1 category, materialType, \2\3', func_text)

    # Now we write it back
    new_content = content[:start_idx] + func_text + content[end_idx:]
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Successfully patched processDongshinItem!")
else:
    print("Function not found.")
