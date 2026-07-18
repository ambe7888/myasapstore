import os
import re

directory = r"c:\xampp\htdocs\myasapstore\resources\js\pages\store"

modified_files = []

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find all occurrences of <StoreLayout
            pos = 0
            new_content = content
            while True:
                idx = new_content.find('<StoreLayout', pos)
                if idx == -1:
                    break
                
                # Find the true closing '>' of this <StoreLayout tag by balancing braces
                brace_count = 0
                in_quote = None
                end_tag_idx = -1
                for i in range(idx + 12, len(new_content)):
                    char = new_content[i]
                    if in_quote:
                        if char == in_quote:
                            in_quote = None
                        continue
                    if char in ('"', "'", '`'):
                        in_quote = char
                        continue
                    if char == '{':
                        brace_count += 1
                        continue
                    if char == '}':
                        brace_count -= 1
                        continue
                    if char == '>' and brace_count == 0:
                        end_tag_idx = i
                        break
                
                if end_tag_idx == -1:
                    pos = idx + 12
                    continue
                
                # From end_tag_idx + 1, find the next JSX tag
                # Skip comments like {/* ... */}
                search_slice = new_content[end_tag_idx + 1:]
                
                # Pattern to find the next tag, skipping optionally a breadcrumb tag or comments
                # Let's match optionally:
                # 1. Whitespace
                # 2. {/* comment */}
                # 3. <tag className="...store-breadcrumb...">...</tag>
                # and then finally a <div or <section or <nav tag.
                
                # Let's write a parser that scans tags
                # First, find the first tag that is NOT a comment and NOT store-breadcrumb
                # We can do this using a regex search on the slice
                tag_pattern = re.compile(r'^\s*(?:\{\s*/\*.*?\*/\s*\}\s*)*\s*<(div|section|nav|div|section|nav)\s+className="([^"]+)"', re.DOTALL | re.IGNORECASE)
                
                match = tag_pattern.search(search_slice)
                if match:
                    tag = match.group(1)
                    class_attr = match.group(2)
                    
                    # If this tag is the breadcrumb, skip it and look after it
                    if 'store-breadcrumb' in class_attr:
                        # Find the closing tag for this breadcrumb
                        # Usually it's just </div or </nav or </section
                        close_tag = f'</{tag}>'
                        close_idx = search_slice.find(close_tag, match.end())
                        if close_idx != -1:
                            next_slice = search_slice[close_idx + len(close_tag):]
                            next_match = tag_pattern.search(next_slice)
                            if next_match:
                                tag = next_match.group(1)
                                class_attr = next_match.group(2)
                                if 'store-page-header' not in class_attr:
                                    # Modify class_attr in next_slice
                                    start_in_content = end_tag_idx + 1 + close_idx + len(close_tag) + next_match.start()
                                    end_in_content = end_tag_idx + 1 + close_idx + len(close_tag) + next_match.end()
                                    
                                    new_class_attr = f'{class_attr} store-page-header'
                                    replacement = next_match.group(0).replace(f'className="{class_attr}"', f'className="{new_class_attr}"')
                                    new_content = new_content[:start_in_content] + replacement + new_content[end_in_content:]
                                    break
                    else:
                        # This first tag is NOT breadcrumb. Check if it's already page-header
                        if 'store-page-header' not in class_attr:
                            # Modify class_attr
                            start_in_content = end_tag_idx + 1 + match.start()
                            end_in_content = end_tag_idx + 1 + match.end()
                            
                            new_class_attr = f'{class_attr} store-page-header'
                            replacement = match.group(0).replace(f'className="{class_attr}"', f'className="{new_class_attr}"')
                            new_content = new_content[:start_in_content] + replacement + new_content[end_in_content:]
                            break
                            
                pos = end_tag_idx + 1
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                modified_files.append(filepath)

print(f"Modified {len(modified_files)} files:")
for f in modified_files:
    print(f" - {f}")
