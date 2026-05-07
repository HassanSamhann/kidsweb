import json
import re

def clean_text(text):
    if not text:
        return ""
    # Remove "stop" (case insensitive, word boundary)
    text = re.sub(r'\bstop\b', '', text, flags=re.IGNORECASE)
    
    # Remove these specific sequences found in the data
    text = text.replace("\\n', '", " ")
    text = text.replace("\\n\", \"", " ")
    text = text.replace("', '", " ")
    text = text.replace("\", \"", " ")
    text = text.replace("\\n", " ")
    
    # Remove any stray quotes or punctuation at the very beginning/end
    text = text.strip("'\",. ")
    
    # Clean multiple spaces and ensure it's readable
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def main():
    try:
        with open('data/azkar.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        cleaned_data = {}
        for category, items in data.items():
            cleaned_items = []
            for item in items:
                # Sometimes items are lists themselves or dicts
                if isinstance(item, list):
                    # Handle case where it's a list of dicts
                    for subitem in item:
                        if isinstance(subitem, dict):
                            subitem['content'] = clean_text(subitem.get('content', ''))
                            subitem['description'] = clean_text(subitem.get('description', ''))
                            subitem['reference'] = clean_text(subitem.get('reference', ''))
                            if subitem['content']:
                                cleaned_items.append(subitem)
                elif isinstance(item, dict):
                    item['content'] = clean_text(item.get('content', ''))
                    item['description'] = clean_text(item.get('description', ''))
                    item['reference'] = clean_text(item.get('reference', ''))
                    if item['content']:
                        cleaned_items.append(item)
            
            if cleaned_items:
                cleaned_data[category] = cleaned_items

        with open('data/azkar_clean.json', 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=3)
            
        print("Successfully cleaned Azkar data.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
