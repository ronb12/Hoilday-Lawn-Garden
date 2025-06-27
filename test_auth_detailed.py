#!/usr/bin/env python3
"""
Detailed authentication test for admin dashboard buttons
"""

import requests
import re
import json

BASE_URL = "https://ronb12.github.io/Holliday-Lawn-Garden"

ADMIN_PAGES = [
    "appointments.html",
    "customers.html", 
    "payments.html",
    "analytics.html",
    "inventory.html",
    "staff.html",
    "messages.html"
]

def check_firebase_config(content):
    """Check for correct Firebase configuration"""
    issues = []
    
    # Check for wrong appId
    if "1:123456789:web:abcdefghijklmnop" in content:
        issues.append("Wrong Firebase appId found")
    
    # Check for correct appId
    if "1:135322230444:web:1a487b25a48aae07368909" in content:
        issues.append("✅ Correct Firebase appId found")
    
    # Check for wrong messagingSenderId
    if "messagingSenderId: \"123456789\"" in content:
        issues.append("Wrong messagingSenderId found")
    
    # Check for correct messagingSenderId
    if "messagingSenderId: \"135322230444\"" in content:
        issues.append("✅ Correct messagingSenderId found")
    
    return issues

def check_auth_patterns(content):
    """Check for authentication/logout patterns"""
    issues = []
    
    # Check for login redirects
    if "login.html" in content:
        issues.append("Login page redirect detected")
    
    if "admin-login.html" in content:
        issues.append("Admin login redirect detected")
    
    # Check for auth error messages
    auth_errors = [
        "not authenticated",
        "authentication failed",
        "login required", 
        "access denied",
        "unauthorized",
        "please log in",
        "session expired"
    ]
    
    for error in auth_errors:
        if error.lower() in content.lower():
            issues.append(f"Auth error message: {error}")
    
    # Check for Firebase auth issues
    firebase_auth_issues = [
        "firebase.*auth.*error",
        "auth.*failed",
        "user.*not.*found",
        "permission.*denied"
    ]
    
    for pattern in firebase_auth_issues:
        if re.search(pattern, content, re.IGNORECASE):
            issues.append(f"Firebase auth issue: {pattern}")
    
    return issues

def check_loading_issues(content):
    """Check for loading state issues"""
    issues = []
    
    # Check for loading overlays
    if "loading-overlay" in content:
        if "hide-loading.js" not in content:
            issues.append("Loading overlay without hide script")
        else:
            issues.append("✅ Loading overlay with hide script")
    
    # Check for spinner elements
    if "spinner" in content:
        if "hide-loading.js" not in content:
            issues.append("Spinner without hide script")
        else:
            issues.append("✅ Spinner with hide script")
    
    # Check for "Loading..." text
    if "Loading..." in content:
        if "hide-loading.js" not in content:
            issues.append("Loading text without hide script")
        else:
            issues.append("✅ Loading text with hide script")
    
    return issues

def test_page_auth(page_name):
    """Test authentication for a specific page"""
    print(f"\n🔍 Testing {page_name}...")
    
    url = f"{BASE_URL}/{page_name}"
    
    try:
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            content = response.text
            
            print(f"  ✅ HTTP: {response.status_code}")
            print(f"  📄 Size: {len(content):,} chars")
            
            # Check Firebase config
            firebase_issues = check_firebase_config(content)
            if firebase_issues:
                print(f"  🔥 Firebase: {', '.join(firebase_issues)}")
            else:
                print(f"  🔥 Firebase: No issues found")
            
            # Check auth patterns
            auth_issues = check_auth_patterns(content)
            if auth_issues:
                print(f"  🔐 Auth: {', '.join(auth_issues)}")
            else:
                print(f"  🔐 Auth: No issues found")
            
            # Check loading issues
            loading_issues = check_loading_issues(content)
            if loading_issues:
                print(f"  ⏳ Loading: {', '.join(loading_issues)}")
            else:
                print(f"  ⏳ Loading: No issues found")
            
            # Check for admin header
            if "admin-header" in content:
                print(f"  🎯 Admin header: ✅ Found")
            else:
                print(f"  🎯 Admin header: ❌ Missing")
            
            # Check for proper script includes
            js_file = page_name.replace(".html", ".js")
            if js_file in content:
                print(f"  📜 Script: ✅ {js_file} found")
            else:
                print(f"  📜 Script: ❌ {js_file} missing")
            
            return {
                "status": "success",
                "firebase_issues": [i for i in firebase_issues if not i.startswith("✅")],
                "auth_issues": auth_issues,
                "loading_issues": [i for i in loading_issues if not i.startswith("✅")],
                "has_admin_header": "admin-header" in content,
                "has_script": js_file in content
            }
        else:
            print(f"  ❌ HTTP Error: {response.status_code}")
            return {"status": "error", "http_code": response.status_code}
            
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return {"status": "error", "message": str(e)}

def main():
    """Main test function"""
    print("🚀 Starting Detailed Authentication Test")
    print("=" * 50)
    
    results = {}
    total_issues = 0
    
    for page in ADMIN_PAGES:
        result = test_page_auth(page)
        results[page] = result
        
        if result.get("status") == "success":
            total_issues += len(result.get("firebase_issues", []))
            total_issues += len(result.get("auth_issues", []))
            total_issues += len(result.get("loading_issues", []))
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 AUTHENTICATION TEST SUMMARY")
    print("=" * 50)
    
    successful_tests = sum(1 for r in results.values() if r.get("status") == "success")
    total_tests = len(results)
    
    print(f"✅ Successful tests: {successful_tests}/{total_tests}")
    print(f"❌ Failed tests: {total_tests - successful_tests}")
    print(f"⚠️  Total issues: {total_issues}")
    
    if total_issues == 0:
        print("\n🎉 PERFECT! No authentication issues detected.")
        print("All admin dashboard buttons should work without logout problems.")
    else:
        print(f"\n⚠️  ISSUES FOUND:")
        for page, result in results.items():
            if result.get("status") == "success":
                issues = []
                issues.extend(result.get("firebase_issues", []))
                issues.extend(result.get("auth_issues", []))
                issues.extend(result.get("loading_issues", []))
                
                if issues:
                    print(f"  • {page}: {', '.join(issues)}")
    
    return total_issues == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 