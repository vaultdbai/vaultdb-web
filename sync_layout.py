import os
import glob
import copy
from bs4 import BeautifulSoup
from pathlib import Path

# Exclusion list for layout syncing (documentation folders have their own custom nav)
EXCLUDE_DIRS = ["docs", "products", "marketplace"]

def adjust_paths(soup, depth):
    if depth == 0:
        return
    prefix = '../' * depth
    
    # Adjust href
    for tag in soup.find_all(['a', 'link']):
        href = tag.get('href')
        if href and not href.startswith(('http', 'mailto:', '#')):
            if not href.startswith('../'):
                tag['href'] = prefix + href

    # Adjust src
    for tag in soup.find_all(['img', 'script']):
        src = tag.get('src')
        if src and not src.startswith(('http', 'data:')):
            if not src.startswith('../'):
                tag['src'] = prefix + src

def sync_layouts():
    # Use relative pathing to ensure portability
    base_dir = Path(os.path.abspath(os.path.dirname(__file__)))
    index_path = base_dir / 'index.html'
    
    if not index_path.exists():
        print(f"Error: index.html not found in {base_dir}")
        return

    with open(index_path, 'r', encoding='utf-8') as f:
        orig_html = f.read()

    soup = BeautifulSoup(orig_html, 'html.parser')
    
    master_header = soup.find('header', class_='header')
    master_sidebar = soup.find('div', class_='side_accordian')
    master_footer = soup.find('section', class_='footer_section')
    
    if not (master_header and master_sidebar and master_footer):
        print("Error: Could not find one of the master components in index.html")
        return

    # Find all html files
    html_files = glob.glob(str(base_dir / '**' / '*.html'), recursive=True)
    
    for filepath_str in html_files:
        filepath = Path(filepath_str)
        
        # Skip master page
        if filepath == index_path:
            continue
            
        # Check if file is inside an excluded directory
        rel_path = filepath.relative_to(base_dir)
        if any(part in EXCLUDE_DIRS for part in rel_path.parts):
            print(f"Skipping {rel_path} (Inside excluded doc directory)")
            continue
            
        print(f"Syncing layout in {rel_path}")
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        page_soup = BeautifulSoup(content, 'html.parser')
        depth = len(rel_path.parts) - 1
        
        # Replace Header
        curr_header = page_soup.find('header', class_='header')
        if curr_header:
            new_header = copy.copy(master_header)
            adjust_paths(new_header, depth)
            curr_header.replace_with(new_header)
            
        # Replace Sidebar (Mobile)
        curr_sidebar = page_soup.find('div', class_='side_accordian')
        if curr_sidebar:
            new_sidebar = copy.copy(master_sidebar)
            adjust_paths(new_sidebar, depth)
            curr_sidebar.replace_with(new_sidebar)
            
        # Replace Footer
        curr_footer = page_soup.find('section', class_='footer_section')
        if curr_footer:
            new_footer = copy.copy(master_footer)
            adjust_paths(new_footer, depth)
            curr_footer.replace_with(new_footer)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(page_soup.prettify())
            
    print("✨ Sync complete.")

if __name__ == "__main__":
    sync_layouts()
