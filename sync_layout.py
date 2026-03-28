import os
import glob
import copy
from bs4 import BeautifulSoup

def adjust_paths(soup, depth):
    if depth == 0:
        return
    prefix = '../' * depth
    
    # Adjust href
    for tag in soup.find_all(['a', 'link']):
        href = tag.get('href')
        if href and not href.startswith('http') and not href.startswith('mailto:') and not href.startswith('#'):
            # If it already starts with ../, don't prefix it extra if we are just cloning from index
            if not href.startswith('../'):
                tag['href'] = prefix + href

    # Adjust src
    for tag in soup.find_all(['img', 'script']):
        src = tag.get('src')
        if src and not src.startswith('http') and not src.startswith('data:'):
            if not src.startswith('../'):
                tag['src'] = prefix + src

def sync_layouts():
    base_dir = '/vaultdb/vaultdb-web'
    index_path = os.path.join(base_dir, 'index.html')
    
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
    html_files = glob.glob(os.path.join(base_dir, '**', '*.html'), recursive=True)
    
    for filepath in html_files:
        if filepath == index_path:
            continue
            
        print(f"Syncing layout in {filepath}")
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        page_soup = BeautifulSoup(content, 'html.parser')
        
        # Calculate depth for relative paths
        rel_path = os.path.relpath(filepath, base_dir)
        depth = rel_path.count(os.sep)
        
        # Replace Header
        curr_header = page_soup.find('header', class_='header')
        if curr_header:
            new_header = copy.copy(master_header)
            adjust_paths(new_header, depth)
            curr_header.replace_with(new_header)
            
        # Replace Sidebar
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
            f.write(str(page_soup))
            
    print("Sync complete.")

if __name__ == "__main__":
    sync_layouts()
