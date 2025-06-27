#!/usr/bin/env python3
"""
Test script to check admin dashboard navigation for logout issues
"""

import requests
import time
from urllib.parse import urljoin

# Base URL
BASE_URL = "https://ronb12.github.io/Holliday-Lawn-Garden"

# Admin dashboard sections to test
ADMIN_SECTIONS = [
    "appointments.html",
    "customers.html", 
    "payments.html",
    "analytics.html",
    "inventory.html",
    "staff.html",
    "messages.html"
]

def test_page_access(url, page_name):
    """Test if a page is accessible and check for authentication issues"""
    try:
        print(f"\n🔍 Testing {page_name}...")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            content = response.text
            
            # Check for loading overlays that might cause issues
            loading_indicators = [
                "Loading...",
                "loading-overlay",
                "loading-content",
                "spinner"
            ]
            
            loading_found = []
            for indicator in loading_indicators:
                if indicator in content:
                    loading_found.append(indicator)
            
            # Check for hide-loading.js script
            has_hide_loading = "hide-loading.js" in content
            
            # Check for Firebase config issues
            firebase_issues = []
            if "1:123456789:web:abcdefghijklmnop" in content:
                firebase_issues.append("Wrong appId found")
            if "messagingSenderId: \"123456789\"" in content:
                firebase_issues.append("Wrong messagingSenderId found")
            
            # Check for admin header
            has_admin_header = "admin-header" in content
            
            # Check for proper script includes
            script_issues = []
            if page_name != "appointments.html" and "appointments.js" not in content:
                # Check if page has its own JS file
                js_file = page_name.replace(".html", ".js")
                if js_file not in content:
                    script_issues.append(f"Missing {js_file} script")
            
            print(f"  ✅ Status: {response.status_code}")
            print(f"  📄 Content length: {len(content)} characters")
            print(f"  🎯 Admin header: {'✅' if has_admin_header else '❌'}")
            print(f"  🚫 Hide loading script: {'✅' if has_hide_loading else '❌'}")
            
            if loading_found:
                print(f"  ⚠️  Loading indicators found: {', '.join(loading_found)}")
            else:
                print(f"  ✅ No problematic loading indicators")
                
            if firebase_issues:
                print(f"  ❌ Firebase issues: {', '.join(firebase_issues)}")
            else:
                print(f"  ✅ Firebase config looks correct")
                
            if script_issues:
                print(f"  ❌ Script issues: {', '.join(script_issues)}")
            else:
                print(f"  ✅ Scripts look good")
            
            return {
                "status": "success",
                "has_loading": bool(loading_found),
                "has_hide_loading": has_hide_loading,
                "firebase_issues": firebase_issues,
                "script_issues": script_issues,
                "has_admin_header": has_admin_header
            }
        else:
            print(f"  ❌ Status: {response.status_code}")
            return {"status": "error", "code": response.status_code}
            
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return {"status": "error", "message": str(e)}

def main():
    """Main test function"""
    print("🚀 Starting Admin Dashboard Navigation Test")
    print("=" * 50)
    
    results = {}
    issues_found = []
    
    # Test main admin dashboard
    print("\n📊 Testing Main Admin Dashboard...")
    dashboard_result = test_page_access(f"{BASE_URL}/admin-dashboard.html", "admin-dashboard.html")
    results["admin-dashboard.html"] = dashboard_result
    
    # Test all admin sections
    for section in ADMIN_SECTIONS:
        url = f"{BASE_URL}/{section}"
        result = test_page_access(url, section)
        results[section] = result
        
        # Check for potential issues
        if result.get("status") == "success":
            if result.get("has_loading") and not result.get("has_hide_loading"):
                issues_found.append(f"{section}: Has loading overlay but no hide-loading.js")
            if result.get("firebase_issues"):
                issues_found.append(f"{section}: {', '.join(result['firebase_issues'])}")
            if result.get("script_issues"):
                issues_found.append(f"{section}: {', '.join(result['script_issues'])}")
        else:
            issues_found.append(f"{section}: {result.get('message', 'Access failed')}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    successful_tests = sum(1 for r in results.values() if r.get("status") == "success")
    total_tests = len(results)
    
    print(f"✅ Successful tests: {successful_tests}/{total_tests}")
    print(f"❌ Failed tests: {total_tests - successful_tests}")
    
    if issues_found:
        print(f"\n⚠️  ISSUES FOUND ({len(issues_found)}):")
        for issue in issues_found:
            print(f"  • {issue}")
    else:
        print("\n🎉 No issues found! All pages should work correctly.")
    
    # Specific recommendations
    print(f"\n💡 RECOMMENDATIONS:")
    if any(r.get("has_loading") and not r.get("has_hide_loading") for r in results.values()):
        print("  • Add hide-loading.js to pages with loading overlays")
    if any(r.get("firebase_issues") for r in results.values()):
        print("  • Fix Firebase configuration in affected JS files")
    if any(r.get("script_issues") for r in results.values()):
        print("  • Add missing script includes")
    
    return len(issues_found) == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
