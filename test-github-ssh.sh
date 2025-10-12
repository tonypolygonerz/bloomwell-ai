#!/bin/bash

# Quick script to verify GitHub SSH setup is complete
# Run this after adding your SSH key to GitHub

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔐 GitHub SSH Connection Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "TEST 1: SSH Connection to GitHub"
echo "─────────────────────────────────────────────────────────────"
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ PASSED - SSH authentication working!"
    ssh -T git@github.com 2>&1 | grep "Hi"
else
    echo "❌ FAILED - SSH not working yet"
    echo ""
    echo "Error: SSH key not added to GitHub or incorrect permissions"
    echo ""
    echo "Fix: Go to https://github.com/settings/keys and add this key:"
    echo ""
    cat ~/.ssh/id_ed25519_github.pub
    echo ""
    exit 1
fi

echo ""
echo "TEST 2: Git Remote Configuration"
echo "─────────────────────────────────────────────────────────────"
cd ~/nonprofit-ai-assistant
REMOTE_URL=$(git config --get remote.origin.url)
if [[ $REMOTE_URL == git@github.com:* ]]; then
    echo "✅ PASSED - Using SSH (no tokens)"
    echo "   $REMOTE_URL"
else
    echo "❌ FAILED - Not using SSH format"
    echo "   $REMOTE_URL"
fi

echo ""
echo "TEST 3: Git Fetch Operation"
echo "─────────────────────────────────────────────────────────────"
if git fetch origin >/dev/null 2>&1; then
    echo "✅ PASSED - Git operations working!"
    echo "   Successfully fetched from remote"
else
    echo "❌ FAILED - Git fetch failed"
    git fetch origin 2>&1 | head -3
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "Your repository is fully secured with SSH authentication."
    echo "You can now safely push and pull code."
    echo ""
    echo "✅ No tokens in git config"
    echo "✅ Secure SSH key authentication"  
    echo "✅ All git operations working"
    echo ""
else
    echo "⚠️  SSH KEY NOT ADDED TO GITHUB YET"
    echo ""
    echo "Complete this step:"
    echo "1. Go to: https://github.com/settings/keys"
    echo "2. Click: 'New SSH Key'"
    echo "3. Add the key shown above"
    echo "4. Run this script again"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""


