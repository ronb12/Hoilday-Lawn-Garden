#!/usr/bin/env python3
"""
Test script to simulate clicking admin dashboard buttons and check for logout issues
"""

import requests
import time
from urllib.parse import urljoin
import re

# Base URL
BASE_URL = "https://ronb12.github.io/Holliday-Lawn-Garden"

# Admin dashboard buttons to test
ADMIN_BUTTONS = [
    {
        "name": "View All Appointments",
        "url": "appointments.html",
        "expected_title": "Appointments"
    },
    {
        "name": "View All Customers", 
        "url": "customers.html",
        "expected_title": "Customers"
    },
    {
        "name": "View All Payments",
        "url": "payments.html", 
        "expected_title": "Payments"
    },
    {
        "name": "View Analytics",
        "url": "analytics.html",
        "expected_title": "Analytics"
    },
    {
        "name": "Manage Inventory",
        "url": "inventory.html",
        "expected_title": "Inventory"
    },
    {
        "name": "View Staff",
        "url": "staff.html",
        "expected_title": "Staff"
    },
    {
        "name": "View Messages",
        "url": "messages.html",
        "expected_title": "Messages"
    }
]

def extract_page_title(content):
    """Extract page title from HTML content"""
    title_match = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
    if title_match:
        return title_match.group(1).strip()
    
    # Fallback to h1 or main heading
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', content, re.IGNORECASE | re.DOTALL)
    if h1_match:
        return h1_match.group(1).strip()
    
    return "No title found"

def check_for_logout_indicators(content):
    """Check for indicators that suggest logout/authentication issues"""
    logout_indicators = []
    
    # Check for login redirects
    if "login.html" in content or "admin-login.html" in content:
        logout_indicators.append("Login page redirect detected")
    
    # Check for authentication errors
    auth_error_patterns = [
        "not authenticated",
        "authentication failed", 
        "login required",
        "access denied",
        "unauthorized",
        "please log in"
    ]
    
    for pattern in auth_error_patterns:
        if pattern.lower() in content.lower():
            logout_indicators.append(f"Auth error: {pattern}")
    
    # Check for loading states that might indicate auth issues
    if "Loading..." in content and "hide-loading.js" not in content:
        logout_indicators.append("Loading state without hide script")
    
    # Check for Firebase auth errors
    firebase_auth_patterns = [
        "firebase.*auth.*error",
        "auth.*failed",
        "user.*not.*found"
    ]
    
    for pattern in firebase_auth_patterns:
        if re.search(pattern, content, re.IGNORECASE):
            logout_indicators.append(f"Firebase auth issue: {pattern}")
    
    return logout_indicators

def check_page_content(content, button_info):
    """Analyze page content for potential issues"""
    issues = []
    
    # Check if page has expected content
    expected_title = button_info["expected_title"]
    page_title = extract_page_title(content)
    
    if expected_title.lower() not in page_title.lower():
        issues.append(f"Unexpected page title: '{page_title}' (expected '{expected_title}')")
    
    # Check for admin header
    if "admin-header" not in content:
        issues.append("Missing admin header")
    
    # Check for proper navigation
    if "admin-dashboard.html" not in content:
        issues.append("Missing link back to admin dashboard")
    
    # Check for logout indicators
    logout_issues = check_for_logout_indicators(content)
    issues.extend(logout_issues)
    
    # Check for Firebase configuration
    if "1:123456789:web:abcdefghijklmnop" in content:
        issues.append("Wrong Firebase appId found")
    
    # Check for proper script includes
    js_file = button_info["url"].replace(".html", ".js")
    if js_file not in content:
        issues.append(f"Missing {js_file} script")
    
    return issues

def test_button_click(button_info):
    """Test clicking a specific button by accessing its target page"""
    button_name = button_info["name"]
    target_url = f"{BASE_URL}/{button_info['url']}"
    
    print(f"\n🔘 Testing: {button_name}")
    print(f"   📍 Target: {target_url}")
    
    try:
        # Simulate button click by accessing the page
        response = requests.get(target_url, timeout=15)
        
        if response.status_code == 200:
            content = response.text
            content_length = len(content)
            
            print(f"   ✅ Status: {response.status_code}")
            print(f"   📄 Content: {content_length:,} characters")
            
            # Analyze page content
            issues = check_page_content(content, button_info)
            
            if issues:
                print(f"   ❌ Issues found ({len(issues)}):")
                for issue in issues:
                    print(f"      • {issue}")
                return {
                    "status": "issues",
                    "issues": issues,
                    "content_length": content_length
                }
            else:
                print(f"   ✅ No issues detected")
                return {
                    "status": "success",
                    "content_length": content_length
                }
        else:
            print(f"   ❌ HTTP Error: {response.status_code}")
            return {
                "status": "error",
                "http_code": response.status_code
            }
            
    except requests.exceptions.Timeout:
        print(f"   ❌ Timeout error")
        return {"status": "timeout"}
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return {"status": "error", "message": str(e)}

def main():
    """Main test function"""
    print("🚀 Starting Admin Dashboard Button Click Test")
    print("=" * 60)
    
    results = {}
    total_issues = 0
    
    # Test each button
    for button_info in ADMIN_BUTTONS:
        result = test_button_click(button_info)
        results[button_info["name"]] = result
        
        if result.get("status") == "issues":
            total_issues += len(result.get("issues", []))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 BUTTON CLICK TEST SUMMARY")
    print("=" * 60)
    
    successful_clicks = sum(1 for r in results.values() if r.get("status") == "success")
    total_buttons = len(ADMIN_BUTTONS)
    
    print(f"✅ Successful button clicks: {successful_clicks}/{total_buttons}")
    print(f"❌ Failed/Issues: {total_buttons - successful_clicks}")
    print(f"⚠️  Total issues found: {total_issues}")
    
    # Detailed results
    print(f"\n📊 DETAILED RESULTS:")
    for button_name, result in results.items():
        status_icon = "✅" if result.get("status") == "success" else "❌"
        print(f"  {status_icon} {button_name}")
        
        if result.get("status") == "issues":
            for issue in result.get("issues", []):
                print(f"      ⚠️  {issue}")
    
    # Recommendations
    if total_issues > 0:
        print(f"\n💡 RECOMMENDATIONS:")
        if any("Wrong Firebase appId" in str(r.get("issues", [])) for r in results.values()):
            print("  • Fix Firebase configuration in JS files")
        if any("Missing admin header" in str(r.get("issues", [])) for r in results.values()):
            print("  • Add admin headers to affected pages")
        if any("Loading state" in str(r.get("issues", [])) for r in results.values()):
            print("  • Add hide-loading.js to pages with loading states")
        if any("Login page redirect" in str(r.get("issues", [])) for r in results.values()):
            print("  • Fix authentication logic in affected pages")
    else:
        print(f"\n🎉 All buttons working correctly! No logout issues detected.")
    
    return total_issues == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 