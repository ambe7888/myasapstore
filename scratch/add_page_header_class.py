import os
import re

directory = r"c:\xampp\htdocs\myasapstore\resources\js"

# Pattern to match Page Header or Hero Section comment followed by div/section className
pattern_react = re.compile(
    r'(/\*\s*(Page Header|Hero Section)\s*\*/\s*\}\s*<(div|section|nav)\s+className="([^"]+)")',
    re.IGNORECASE
)

modified_files = []

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            # Skip the main home index.tsx page if we don't want to touch any home layout components, 
            # though it doesn't have div page headers anyway.
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # Find and replace
            matches = list(pattern_react.finditer(new_content))
            if matches:
                for match in reversed(matches):
                    full_match = match.group(1)
                    tag = match.group(3)
                    class_attr = match.group(4)
                    
                    # Avoid duplicate and avoid adding to elements that are already breadcrumbs or don't fit
                    if 'store-page-header' not in class_attr and 'store-breadcrumb' not in class_attr:
                        start, end = match.span()
                        replacement = full_match.replace(f'className="{class_attr}"', f'className="{class_attr} store-page-header"')
                        new_content = new_content[:start] + replacement + new_content[end:]

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files.append(filepath)

print(f"Modified {len(modified_files)} files:")
for f in modified_files:
    print(f" - {f}")
