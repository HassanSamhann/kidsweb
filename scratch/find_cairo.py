import json
import os

def find_cairo():
    file_path = r'C:\Users\Hassan\.gemini\antigravity\brain\2b97c21e-0a79-4f7c-9e7d-67df221a7453\.system_generated\steps\459\content.md'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # The content has a header, then ---, then JSON
    parts = content.split('---')
    if len(parts) < 2:
        print("Could not find JSON part")
        return
    
    json_str = parts[1].strip()
    try:
        data = json.loads(json_str)
        for radio in data.get('radios', []):
            name = radio.get('name', '')
            if 'القاهرة' in name:
                print(f"Found: {name} -> {radio.get('url')}")
    except Exception as e:
        # If it's too big or has issues, try regex
        import re
        # Find all name and url pairs
        matches = re.findall(r'"name":"([^"]+)","url":"([^"]+)"', json_str)
        print(f"Total matches found: {len(matches)}")
        for name, url in matches:
            try:
                # Handle double backslashes in JSON
                decoded_name = name.encode('utf-8').decode('unicode-escape')
            except Exception as e:
                decoded_name = name
            
            if 'القاهرة' in decoded_name or 'Cairo' in decoded_name.lower():
                print(f"MATCH: {decoded_name} -> {url}")
            elif 'مصر' in decoded_name:
                print(f"MATCH (Egypt): {decoded_name} -> {url}")

if __name__ == "__main__":
    find_cairo()
