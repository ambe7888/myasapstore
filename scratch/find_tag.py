import re

filepath = r"c:\xampp\htdocs\myasapstore\resources\js\pages\store\furniture-interior\FurnitureCart.tsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(
    r'(<StoreLayout[^>]*>\s*(?:\{\s*/\*\s*Breadcrumbs?\s*\*/\s*\}\s*<(?:div|nav|section)\s+className="[^"]+store-breadcrumb[^"]*"\s*>.*?</(?:div|nav|section)>\s*)?)\s*<(div|section|nav)\s+className="([^"]+)"',
    re.DOTALL | re.IGNORECASE
)

match = pattern.search(content)
if match:
    print("Match found!")
    print("Prefix:", match.group(1))
    print("Tag:", match.group(2))
    print("Class:", match.group(3))
else:
    print("NO Match found!")
