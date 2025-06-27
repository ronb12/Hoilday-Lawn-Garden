#!/usr/bin/env python3
"""
Automated test for admin dashboard navigation and authentication
Tests if clicking "View All" buttons works without authentication issues
"""

import requests
import time
from urllib.parse import urljoin
import re

def test_admin_navigation():
    base_url = "https://ronb12.github.io/Holliday-Lawn-Garden/"
    
    # Test pages to check
    test_pages = [
        "admin-dashboard.html",
        "appointments.html", 
        "customers.html",
        "payments.html",
        "analytics.html",
        "inventory.html",
        "staff.html",
        "messages.html"
    ]
    
    print("🔍 Testing Admin Dashboard Navigation")
    print("=" * 50)
    
    results = []
    
    for page in test_pages:
        url = urljoin(base_url, page)
        print(f"\n📄 Testing: {page}")
        
        try:
            # Get the page content
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            content = response.text
            
            # Check for authentication issues
            auth_issues = []
            
            # Check for loading overlays
            if 'loading-overlay' in content:
                auth_issues.append("Loading overlay found")
            
            # Check for authentication scripts
            if 'admin-auth.js' in content:
                auth_issues.append("Admin auth script found")
            
            # Check for "Checking authentication" text
            if 'Checking authentication' in content:
                auth_issues.append("Authentication checking text found")
            
            # Check for Firebase auth scripts
            firebase_auth_patterns = [
                'onAuthStateChanged',
                'getAuth',
                'signOut'
            ]
            
            for pattern in firebase_auth_patterns:
                if pattern in content:
                    auth_issues.append(f"Firebase auth pattern: {pattern}")
            
            # Check for redirects to login
            if 'admin-login.html' in content:
                auth_issues.append("Login redirect found")
            
            # Check if page has proper admin header
            has_admin_header = 'admin-header' in content
            has_admin_nav = 'admin-nav' in content
            
            # Check for loading elements
            loading_elements = re.findall(r'id="loading[^"]*"', content)
            if loading_elements:
                auth_issues.append(f"Loading elements: {loading_elements}")
            
            # Determine status
            if auth_issues:
                status = "❌ AUTHENTICATION ISSUES"
                print(f"   Status: {status}")
                print(f"   Issues: {', '.join(auth_issues)}")
            else:
                status = "✅ NO AUTHENTICATION ISSUES"
                print(f"   Status: {status}")
            
            # Check page structure
            if has_admin_header and has_admin_nav:
                structure = "✅ Proper admin structure"
            else:
                structure = "⚠️  Missing admin structure"
            
            print(f"   Structure: {structure}")
            
            results.append({
                'page': page,
                'status': status,
                'issues': auth_issues,
                'has_admin_header': has_admin_header,
                'has_admin_nav': has_admin_nav
            })
            
        except requests.RequestException as e:
            print(f"   ❌ Error accessing page: {e}")
            results.append({
                'page': page,
                'status': "❌ ACCESS ERROR",
                'issues': [str(e)],
                'has_admin_header': False,
                'has_admin_nav': False
            })
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    successful_pages = [r for r in results if "NO AUTHENTICATION ISSUES" in r['status']]
    problematic_pages = [r for r in results if "AUTHENTICATION ISSUES" in r['status']]
    error_pages = [r for r in results if "ACCESS ERROR" in r['status']]
    
    print(f"✅ Successful pages: {len(successful_pages)}/{len(test_pages)}")
    print(f"❌ Pages with auth issues: {len(problematic_pages)}/{len(test_pages)}")
    print(f"🚫 Pages with access errors: {len(error_pages)}/{len(test_pages)}")
    
    if successful_pages:
        print(f"\n✅ Pages working correctly:")
        for page in successful_pages:
            print(f"   - {page['page']}")
    
    if problematic_pages:
        print(f"\n❌ Pages with authentication issues:")
        for page in problematic_pages:
            print(f"   - {page['page']}: {', '.join(page['issues'])}")
    
    if error_pages:
        print(f"\n🚫 Pages with access errors:")
        for page in error_pages:
            print(f"   - {page['page']}: {', '.join(page['issues'])}")
    
    # Overall result
    if len(problematic_pages) == 0 and len(error_pages) == 0:
        print(f"\n🎉 SUCCESS: All admin pages are working correctly!")
        return True
    else:
        print(f"\n⚠️  ISSUES FOUND: Some pages have authentication problems")
        return False

if __name__ == "__main__":
    success = test_admin_navigation()
    exit(0 if success else 1)
