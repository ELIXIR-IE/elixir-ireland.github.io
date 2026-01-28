import os
import sys

def validate_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    if len(lines) < 3 or lines[0].strip() != '---':
        return True # Not a Jekyll file or too short
    
    in_front_matter = False
    description_started = False
    for i, line in enumerate(lines):
        if i == 0:
            in_front_matter = True
            continue
        
        strip_line = line.strip()
        if strip_line == '---':
            break
            
        if strip_line.startswith('description:'):
            # Check if it ends in the same line or continues
            # In our case, the breakage occurs when it's split.
            # Simple check: if the next line doesn't have a ':' and isn't '---', it might be a split.
            next_line = lines[i+1].strip() if i+1 < len(lines) else '---'
            if next_line != '---' and ':' not in next_line:
                print(f"CRITICAL: Split description found in {filepath} at line {i+1}")
                return False
    return True

def main():
    has_error = False
    for root, dirs, files in os.walk('.'):
        if '_site' in root or '.git' in root or '.bundle' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                if not validate_file(filepath):
                    has_error = True
    
    if has_error:
        print("\nERROR: YAML Front Matter validation failed!")
        sys.exit(1)
    else:
        print("Success: All YAML Front Matter descriptions are on single lines.")
        sys.exit(0)

if __name__ == "__main__":
    main()
