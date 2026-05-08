#!/bin/bash

# Backup first
echo "Creating backup..."
cp -r src/ src_backup_$(date +%Y%m%d_%H%M%S)/

# Detect OS for sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_INPLACE=(-i '')
else
    SED_INPLACE=(-i)
fi

echo "Fixing routes..."

# Fix AuthService.js - MOST IMPORTANT
sed "${SED_INPLACE[@]}" 's|navigate("/show-pin"|navigate("/individual/show-pin"|g' src/features/auth/services/AuthService.js
sed "${SED_INPLACE[@]}" 's|navigate("/explore"|navigate("/individual/explore"|g' src/features/auth/services/AuthService.js

# Fix interest_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/profile"|navigate("/individual/profile"|g' src/features/interest/pages/interest_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate(`/chats|navigate(`/individual/chats|g' src/features/interest/pages/interest_page.jsx

# Fix chat_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/chats"|navigate("/individual/chats"|g' src/features/chat/pages/chat_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate(`/chats|navigate(`/individual/chats|g' src/features/chat/pages/chat_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/profile"|navigate("/individual/profile"|g' src/features/chat/pages/chat_page.jsx

# Fix match_card.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/profile"|navigate("/individual/profile"|g' src/features/explore/components/match_card.jsx

# Fix my_profile_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/subscription")|navigate("/subscription")|g' src/features/profile/myprofile/pages/my_profile_page.jsx

# Fix guardian_section.jsx
sed "${SED_INPLACE[@]}" 's|navigate('\''/show-pin'\'')|navigate('\''/individual/show-pin'\'')|g' src/features/profile/myprofile/components/guardian_section.jsx

# Fix link_guardian_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate(`/chats|navigate(`/individual/chats|g' src/features/profile/myprofile/pages/link_guardian_page.jsx

# Fix others_profile_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate(`/chats|navigate(`/individual/chats|g' src/features/profile/othersprofile/others_profile_page.jsx

# Fix settings_page.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/subscription-detail"|navigate("/individual/subscription-detail"|g' src/features/setting/pages/settings_page.jsx

# Fix subscription_detail_page.jsx
sed "${SED_INPLACE[@]}" 's|onClick={() => navigate("/subscription")|onClick={() => navigate("/subscription"|g' src/features/setting/pages/subscription_detail_page.jsx

# Fix notifications.jsx
sed "${SED_INPLACE[@]}" 's|navigate(`/chat/|navigate(`/individual/chat/|g' src/features/notifications/notifications.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/interest"|navigate("/individual/interest"|g' src/features/notifications/notifications.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/match"|navigate("/individual/match"|g' src/features/notifications/notifications.jsx

# Fix app_bar.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/notifications")|navigate("/individual/notifications")|g' src/ui/app_bar.jsx
sed "${SED_INPLACE[@]}" 's|navigate("/myprofile")|navigate("/individual/myprofile")|g' src/ui/app_bar.jsx

echo "Done! Check the changes with: git diff src/"