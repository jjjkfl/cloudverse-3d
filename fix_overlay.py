import re

with open('index.html', encoding='utf-8') as f:
    content = f.read()

# Count occurrences
count = content.count('id="tsOverlay"')
print(f'Found {count} tsOverlay element(s)')

if count > 1:
    # Remove everything from the second occurrence of the overlay comment/div to just before </body>
    # Strategy: find the second tsOverlay div and remove it + its wrapping comment
    
    # Find positions of all "id=\"tsOverlay\""
    positions = [i for i in range(len(content)) if content[i:i+16] == 'id="tsOverlay"']
    print(f'Positions: {positions}')
    
    if len(positions) >= 2:
        second_pos = positions[1]
        # Walk back to find the start of the HTML comment before the div
        # Look for "<!-- " before second_pos
        search_start = max(0, second_pos - 200)
        chunk = content[search_start:second_pos]
        comment_offset = chunk.rfind('<!--')
        
        if comment_offset >= 0:
            remove_from = search_start + comment_offset
        else:
            # No comment, just find the <div
            div_offset = chunk.rfind('<div')
            remove_from = search_start + div_offset
        
        # Find the closing </div>\n after the overlay
        # The overlay ends with </div>\n    </div>\n</div>
        # Find </div> after second_pos + enough offset
        end_search = content.find('</div>\n</body>', second_pos)
        if end_search == -1:
            end_search = content.find('</div>\r\n</body>', second_pos)
        
        if end_search != -1:
            remove_to = end_search + len('</div>')
            # Remove the duplicate
            new_content = content[:remove_from] + content[remove_to:]
            with open('index.html', 'w', encoding='utf-8') as f:
                f.write(new_content)
            print('Duplicate removed successfully')
            print(f'Removed {remove_to - remove_from} characters from pos {remove_from} to {remove_to}')
        else:
            print('Could not find end boundary')
else:
    print('Only one overlay found, nothing to remove')
