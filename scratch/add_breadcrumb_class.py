import os
import re

directory = r"c:\xampp\htdocs\myasapstore\resources\js"

modified_files = []

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            
            # Match div, nav, section tags
            matches = list(re.finditer(r'\{\s*/\*\s*Breadcrumbs?\s*\*/\s*\}\s*<(div|nav|section)\s+className="([^"]+)"', new_content, re.IGNORECASE))
            if matches:
                for match in reversed(matches):
                    tag = match.group(1)
                    class_attr = match.group(2)
                    if 'store-breadcrumb' not in class_attr:
                        start, end = match.span()
                        replacement = match.group(0).replace(f'className="{class_attr}"', f'className="{class_attr} store-breadcrumb"')
                        new_content = new_content[:start] + replacement + new_content[end:]

            # Match for general navigation breadcrumb
            matches_nav = list(re.finditer(r'\{\s*/\*\s*Navigation Breadcrumb\s*\*/\s*\}\s*<(div|nav|section)\s+className="([^"]+)"', new_content, re.IGNORECASE))
            if matches_nav:
                for match in reversed(matches_nav):
                    tag = match.group(1)
                    class_attr = match.group(2)
                    if 'store-breadcrumb' not in class_attr:
                        start, end = match.span()
                        replacement = match.group(0).replace(f'className="{class_attr}"', f'className="{class_attr} store-breadcrumb"')
                        new_content = new_content[:start] + replacement + new_content[end:]

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files.append(filepath)

print(f"Modified {len(modified_files)} files:")
for f in modified_files:
    print(f" - {f}")
