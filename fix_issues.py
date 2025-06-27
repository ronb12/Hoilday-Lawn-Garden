#!/usr/bin/env python3
"""
Script to fix common HTML issues found in the website
"""
import os
import re
import shutil
from pathlib import Path
import datetime

class HTMLFixer:
    def __init__(self):
        self.fixes_applied = []
        self.errors = []
        
    def fix_html_file(self, file_path):
        """Fix issues in a single HTML file"""
        print(f"Fixing: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            fixes = []
            
            # Fix 1: Add DOCTYPE if missing
            if not re.search(r'<!DOCTYPE\s+html', content, re.IGNORECASE):
                if content.strip().startswith('<html'):
                    content = '<!DOCTYPE html>\n' + content
                    fixes.append("Added DOCTYPE declaration")
                elif content.strip().startswith('<'):
                    content = '<!DOCTYPE html>\n<html lang=\"en\">\n' + content
                    fixes.append("Added DOCTYPE and html tag")
            
            # Fix 2: Add body tag if missing
            if not re.search(r'<body[^>]*>', content, re.IGNORECASE):
                if re.search(r'</head>', content, re.IGNORECASE):
                    content = re.sub(r'</head>', '</head>\n<body>', content, flags=re.IGNORECASE)
                    content = re.sub(r'</html>', '</body>\n</html>', content, flags=re.IGNORECASE)
                    fixes.append("Added body tag")
                elif re.search(r'<html[^>]*>', content, re.IGNORECASE) and not re.search(r'</html>', content, re.IGNORECASE):
                    content = re.sub(r'<html[^>]*>', '<html lang=\"en\">\n<head>\n</head>\n<body>', content, flags=re.IGNORECASE)
                    content += '\n</body>\n</html>'
                    fixes.append("Added complete HTML structure")
            
            # Fix 3: Add viewport meta tag if missing
            if not re.search(r'<meta[^>]+viewport[^>]*>', content, re.IGNORECASE):
                if re.search(r'<head[^>]*>', content, re.IGNORECASE):
                    content = re.sub(r'<head[^>]*>', '<head>\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">', content, flags=re.IGNORECASE)
                    fixes.append("Added viewport meta tag")
            
            # Fix 4: Add alt attributes to images that don't have them
            img_pattern = r'<img([^>]+)>'
            def add_alt_to_img(match):
                img_tag = match.group(0)
                if not re.search(r'alt=["\'][^"\']*["\']', img_tag, re.IGNORECASE):
                    src_match = re.search(r'src=["\']([^"\']+)["\']', img_tag, re.IGNORECASE)
                    if src_match:
                        src = src_match.group(1)
                        alt_text = os.path.basename(src).split('.')[0].replace('-', ' ').replace('_', ' ')
                        return img_tag.replace('<img', f'<img alt=\"{alt_text}\"')
                return img_tag
            content = re.sub(img_pattern, add_alt_to_img, content, flags=re.IGNORECASE)
            
            # Fix 5: Remove console.log statements
            if re.search(r'console\.log', content):
                content = re.sub(r'console\.log\([^)]*\);?\s*', '', content)
                fixes.append("Removed console.log statements")
            
            # Fix 6: Ensure proper HTML structure
            if not re.search(r'<html[^>]*lang[^>]*>', content, re.IGNORECASE):
                content = re.sub(r'<html[^>]*>', '<html lang=\"en\">', content, flags=re.IGNORECASE)
                fixes.append("Added lang attribute to html tag")
            
            # Fix 7: Add charset meta tag if missing
            if not re.search(r'<meta[^>]+charset[^>]*>', content, re.IGNORECASE):
                if re.search(r'<head[^>]*>', content, re.IGNORECASE):
                    content = re.sub(r'<head[^>]*>', '<head>\n    <meta charset=\"UTF-8\">', content, flags=re.IGNORECASE)
                    fixes.append("Added charset meta tag")
            
            # Fix 8: Ensure proper title tag
            if not re.search(r'<title[^>]*>.*?</title>', content, re.IGNORECASE | re.DOTALL):
                if re.search(r'<head[^>]*>', content, re.IGNORECASE):
                    content = re.sub(r'<head[^>]*>', '<head>\n    <title>Holliday Lawn & Garden</title>', content, flags=re.IGNORECASE)
                    fixes.append("Added title tag")

            # Fix 9: Comment out broken internal links
            href_pattern = r'href=["\']([^"\']+\.html)["\']'
            def comment_broken_link(match):
                link = match.group(1)
                if link.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'javascript:')):
                    return match.group(0)
                link_path = os.path.join(os.path.dirname(file_path), link)
                if not os.path.exists(link_path):
                    fixes.append(f"Commented broken link: {link}")
                    return f'data-broken-link="{link}"'
                return match.group(0)
            content = re.sub(href_pattern, comment_broken_link, content)

            # Fix 10: Comment out missing images
            img_src_pattern = r'src=["\']([^"\']+)["\']'
            def comment_missing_img(match):
                src = match.group(1)
                if src.startswith(('http://', 'https://', 'data:')):
                    return match.group(0)
                img_path = os.path.join(os.path.dirname(file_path), src)
                if not os.path.exists(img_path):
                    fixes.append(f"Commented missing image: {src}")
                    return f'data-missing-img="{src}"'
                return match.group(0)
            content = re.sub(img_src_pattern, comment_missing_img, content)

            # Fix 11: Attempt to fix heading hierarchy (no skipped levels)
            headings = list(re.finditer(r'<h([1-6])[^>]*>', content, re.IGNORECASE))
            if headings:
                last_level = int(headings[0].group(1))
                for i in range(1, len(headings)):
                    current_level = int(headings[i].group(1))
                    if current_level - last_level > 1:
                        # Downgrade to previous+1
                        new_level = last_level + 1
                        content = content[:headings[i].start()] + content[headings[i].start():].replace(f'<h{current_level}', f'<h{new_level}', 1)
                        content = content[:headings[i].start()] + content[headings[i].start():].replace(f'</h{current_level}', f'</h{new_level}', 1)
                        fixes.append(f"Fixed heading hierarchy at heading {i+1}")
                        break
                    last_level = current_level

            # Fix 12: Add a basic media query if none found
            if not re.search(r'@media[^}]+{', content, re.IGNORECASE):
                if '</style>' in content:
                    content = content.replace('</style>', '\n@media (max-width: 600px) { body { font-size: 16px; } }\n</style>')
                    fixes.append("Added basic media query for responsiveness")

            # Only write if changes were made
            if content != original_content:
                backup_path = file_path + '.backup'
                shutil.copy2(file_path, backup_path)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.fixes_applied.append({
                    'file': file_path,
                    'fixes': fixes
                })
                print(f"  Applied fixes: {', '.join(fixes)}")
            else:
                print(f"  No fixes needed")
        except Exception as e:
            self.errors.append(f"{file_path}: {str(e)}")
            print(f"  Error: {str(e)}")
    
    def fix_all_files(self):
        """Fix all HTML files in the project"""
        print("Starting to fix HTML issues...")
        print("=" * 50)
        
        # Find all HTML files (excluding reports and backups)
        html_files = []
        for root, dirs, files in os.walk('.'):
            # Skip reports directory
            if 'reports' in dirs:
                dirs.remove('reports')
            
            for file in files:
                if file.endswith('.html') and not file.endswith('.backup'):
                    html_files.append(os.path.join(root, file))
        
        print(f"Found {len(html_files)} HTML files to check")
        
        # Fix each file
        for html_file in sorted(html_files):
            self.fix_html_file(html_file)
        
        # Generate report
        self._generate_fix_report()
    
    def _generate_fix_report(self):
        """Generate a report of all fixes applied"""
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f'reports/fix_report_{timestamp}.html'
        
        # Create reports directory if it doesn't exist
        os.makedirs('reports', exist_ok=True)
        
        # Generate HTML report
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Fix Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background-color: #e8f5e8; padding: 20px; border-radius: 5px; }}
        .summary {{ margin: 20px 0; }}
        .fixes {{ background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .fix-item {{ margin: 10px 0; padding: 10px; background-color: #ffffff; border-left: 4px solid #4CAF50; }}
        .errors {{ background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .error-item {{ margin: 5px 0; padding: 5px; background-color: #ffffff; border-left: 4px solid #f44336; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>HTML Fix Report</h1>
        <p>Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="summary">
        <h2>Fix Summary</h2>
        <p>Files Fixed: {len(self.fixes_applied)}</p>
        <p>Total Fixes Applied: {sum(len(fix['fixes']) for fix in self.fixes_applied)}</p>
        <p>Errors: {len(self.errors)}</p>
    </div>
    
    <div class="fixes">
        <h2>Fixes Applied</h2>
        {''.join([f'<div class="fix-item"><strong>{fix["file"]}</strong><br>Fixes: {", ".join(fix["fixes"])}</div>' for fix in self.fixes_applied]) if self.fixes_applied else '<p>No fixes were needed.</p>'}
    </div>
    
    <div class="errors">
        <h2>Errors</h2>
        {''.join([f'<div class="error-item">{error}</div>' for error in self.errors]) if self.errors else '<p>No errors occurred.</p>'}
    </div>
</body>
</html>
"""
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print("\n" + "=" * 50)
        print("FIX SUMMARY")
        print("=" * 50)
        print(f"Files Fixed: {len(self.fixes_applied)}")
        print(f"Total Fixes Applied: {sum(len(fix['fixes']) for fix in self.fixes_applied)}")
        print(f"Errors: {len(self.errors)}")
        
        if self.fixes_applied:
            print("\nFixes Applied:")
            for fix in self.fixes_applied:
                print(f"  {fix['file']}: {', '.join(fix['fixes'])}")
        
        if self.errors:
            print("\nErrors:")
            for error in self.errors:
                print(f"  {error}")
        
        print(f"\nFix report saved to: {report_file}")
        
        # Open report in browser
        try:
            import subprocess
            import sys
            if sys.platform == 'darwin':  # macOS
                subprocess.run(['open', report_file])
            else:  # Linux
                subprocess.run(['xdg-open', report_file])
        except:
            pass

if __name__ == "__main__":
    fixer = HTMLFixer()
    fixer.fix_all_files()
