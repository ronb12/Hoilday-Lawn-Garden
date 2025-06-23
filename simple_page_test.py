#!/usr/bin/env python3
"""
Simple page test script to check HTML files for basic issues
"""
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
import datetime

class PageTester:
    def __init__(self):
        self.issues = []
        self.passed = 0
        self.failed = 0
        
    def test_html_file(self, file_path):
        """Test a single HTML file for common issues"""
        print(f"\nTesting: {file_path}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Test 1: Check for proper HTML structure
            if not self._check_html_structure(content, file_path):
                self.failed += 1
                return False
                
            # Test 2: Check for broken links
            broken_links = self._check_links(content, file_path)
            if broken_links:
                self.issues.append(f"{file_path}: Found {len(broken_links)} potentially broken links")
                
            # Test 3: Check for missing images
            missing_images = self._check_images(content, file_path)
            if missing_images:
                self.issues.append(f"{file_path}: Found {len(missing_images)} potentially missing images")
                
            # Test 4: Check for JavaScript errors
            js_errors = self._check_javascript(content, file_path)
            if js_errors:
                self.issues.append(f"{file_path}: Found {len(js_errors)} potential JavaScript issues")
                
            # Test 5: Check for accessibility issues
            accessibility_issues = self._check_accessibility(content, file_path)
            if accessibility_issues:
                self.issues.append(f"{file_path}: Found {len(accessibility_issues)} accessibility issues")
                
            # Test 6: Check for responsive design elements
            responsive_issues = self._check_responsive_design(content, file_path)
            if responsive_issues:
                self.issues.append(f"{file_path}: Found {len(responsive_issues)} responsive design issues")
                
            self.passed += 1
            return True
            
        except Exception as e:
            self.issues.append(f"{file_path}: Error reading file - {str(e)}")
            self.failed += 1
            return False
    
    def _check_html_structure(self, content, file_path):
        """Check for proper HTML structure"""
        # Check for DOCTYPE
        if not re.search(r'<!DOCTYPE\s+html', content, re.IGNORECASE):
            self.issues.append(f"{file_path}: Missing DOCTYPE declaration")
            return False
            
        # Check for html, head, and body tags
        if not re.search(r'<html[^>]*>', content, re.IGNORECASE):
            self.issues.append(f"{file_path}: Missing <html> tag")
            return False
            
        if not re.search(r'<head[^>]*>', content, re.IGNORECASE):
            self.issues.append(f"{file_path}: Missing <head> tag")
            return False
            
        if not re.search(r'<body[^>]*>', content, re.IGNORECASE):
            self.issues.append(f"{file_path}: Missing <body> tag")
            return False
            
        # Check for title tag
        if not re.search(r'<title[^>]*>.*?</title>', content, re.IGNORECASE | re.DOTALL):
            self.issues.append(f"{file_path}: Missing <title> tag")
            return False
            
        return True
    
    def _check_links(self, content, file_path):
        """Check for broken internal links"""
        broken_links = []
        
        # Find all href attributes
        href_pattern = r'href=["\']([^"\']+)["\']'
        links = re.findall(href_pattern, content, re.IGNORECASE)
        
        for link in links:
            # Skip external links and special protocols
            if link.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'javascript:')):
                continue
                
            # Check if internal file exists
            if link.endswith('.html'):
                link_path = os.path.join(os.path.dirname(file_path), link)
                if not os.path.exists(link_path):
                    broken_links.append(link)
                    
        return broken_links
    
    def _check_images(self, content, file_path):
        """Check for missing images"""
        missing_images = []
        
        # Find all img src attributes
        img_pattern = r'<img[^>]+src=["\']([^"\']+)["\'][^>]*>'
        images = re.findall(img_pattern, content, re.IGNORECASE)
        
        for img_src in images:
            # Skip external images
            if img_src.startswith(('http://', 'https://', 'data:')):
                continue
                
            # Check if image file exists
            img_path = os.path.join(os.path.dirname(file_path), img_src)
            if not os.path.exists(img_path):
                missing_images.append(img_src)
                
        return missing_images
    
    def _check_javascript(self, content, file_path):
        """Check for potential JavaScript issues"""
        js_issues = []
        
        # Check for unclosed script tags
        script_tags = re.findall(r'<script[^>]*>', content, re.IGNORECASE)
        script_closing_tags = re.findall(r'</script>', content, re.IGNORECASE)
        
        if len(script_tags) != len(script_closing_tags):
            js_issues.append("Mismatched script tags")
            
        # Check for console.log statements (should be removed in production)
        if re.search(r'console\.log', content):
            js_issues.append("Contains console.log statements")
            
        return js_issues
    
    def _check_accessibility(self, content, file_path):
        """Check for basic accessibility issues"""
        accessibility_issues = []
        
        # Check for alt attributes on images
        img_tags = re.findall(r'<img[^>]+>', content, re.IGNORECASE)
        for img_tag in img_tags:
            if not re.search(r'alt=["\'][^"\']*["\']', img_tag, re.IGNORECASE):
                accessibility_issues.append("Image missing alt attribute")
                break
                
        # Check for proper heading hierarchy
        headings = re.findall(r'<h([1-6])[^>]*>', content, re.IGNORECASE)
        if headings:
            heading_levels = [int(h) for h in headings]
            # Check for skipped heading levels
            for i in range(len(heading_levels) - 1):
                if heading_levels[i+1] - heading_levels[i] > 1:
                    accessibility_issues.append("Skipped heading levels")
                    break
                    
        return accessibility_issues
    
    def _check_responsive_design(self, content, file_path):
        """Check for responsive design elements"""
        responsive_issues = []
        
        # Check for viewport meta tag
        if not re.search(r'<meta[^>]+viewport[^>]*>', content, re.IGNORECASE):
            responsive_issues.append("Missing viewport meta tag")
            
        # Check for CSS media queries
        if not re.search(r'@media[^}]+{', content, re.IGNORECASE):
            responsive_issues.append("No CSS media queries found")
            
        return responsive_issues
    
    def run_tests(self):
        """Run tests on all HTML files in the current directory"""
        print("Starting page tests...")
        print("=" * 50)
        
        # Find all HTML files
        html_files = []
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.endswith('.html'):
                    html_files.append(os.path.join(root, file))
        
        if not html_files:
            print("No HTML files found!")
            return
            
        print(f"Found {len(html_files)} HTML files to test")
        
        # Test each file
        for html_file in sorted(html_files):
            self.test_html_file(html_file)
        
        # Generate report
        self._generate_report()
    
    def _generate_report(self):
        """Generate a test report"""
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f'reports/page_test_report_{timestamp}.html'
        
        # Create reports directory if it doesn't exist
        os.makedirs('reports', exist_ok=True)
        
        # Generate HTML report
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background-color: #f0f0f0; padding: 20px; border-radius: 5px; }}
        .summary {{ margin: 20px 0; }}
        .passed {{ color: green; }}
        .failed {{ color: red; }}
        .issues {{ background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }}
        .issue {{ margin: 5px 0; padding: 5px; background-color: #f8f9fa; border-left: 3px solid #007bff; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Page Test Report</h1>
        <p>Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p><span class="passed">✓ Passed: {self.passed}</span></p>
        <p><span class="failed">✗ Failed: {self.failed}</span></p>
        <p>Total Issues Found: {len(self.issues)}</p>
    </div>
    
    <div class="issues">
        <h2>Issues Found</h2>
        {''.join([f'<div class="issue">{issue}</div>' for issue in self.issues]) if self.issues else '<p>No issues found! All pages passed the basic tests.</p>'}
    </div>
</body>
</html>
"""
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print("\n" + "=" * 50)
        print("TEST SUMMARY")
        print("=" * 50)
        print(f"✓ Passed: {self.passed}")
        print(f"✗ Failed: {self.failed}")
        print(f"Total Issues: {len(self.issues)}")
        
        if self.issues:
            print("\nIssues Found:")
            for issue in self.issues:
                print(f"  - {issue}")
        else:
            print("\n🎉 No issues found! All pages passed the basic tests.")
        
        print(f"\nReport saved to: {report_file}")
        
        # Open report in browser
        try:
            import subprocess
            import sys
            if sys.platform == 'darwin':  # macOS
                subprocess.run(['open', report_file])
            elif sys.platform == 'win32':  # Windows
                os.startfile(report_file)
            else:  # Linux
                subprocess.run(['xdg-open', report_file])
        except:
            pass

if __name__ == "__main__":
    tester = PageTester()
    tester.run_tests()
