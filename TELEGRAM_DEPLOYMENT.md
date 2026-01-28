# Telegram Mini App Deployment Guide

## Overview
This ParkShare app is designed to run as a Telegram Mini App, providing a parking management system for private Telegram chat groups.

## Features
- **Two User Roles**: Parking space owners and regular members
- **Parking Space Management**: Owners can create and manage parking profiles
- **Listings**: Post spaces for sale, long-term rental, or short-term guest parking
- **Requests**: Members can post requests to buy, rent, or request parking
- **Direct Contact**: Telegram and phone contact links for easy communication
- **Mobile-First UI**: Optimized for Telegram's mobile interface

## Setup Instructions

### 1. Deploy Your Application
First, deploy this application to a public URL (e.g., Vercel, Netlify, or your own hosting):

```bash
npm run build
# Deploy the built files to your hosting provider
```

### 2. Create a Telegram Bot
1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the instructions
3. Choose a name and username for your bot
4. Save the bot token provided by BotFather

### 3. Configure Mini App
1. Send `/newapp` to BotFather
2. Select your bot
3. Enter the following details:
   - **Title**: ParkShare
   - **Description**: Parking space management for your community
   - **Photo**: Upload a 640x360 PNG image (optional)
   - **Demo GIF**: Optional
   - **Web App URL**: Your deployed application URL
   - **Short Name**: parkshare

### 4. Add Telegram WebApp Script
Make sure your HTML includes the Telegram WebApp script. Add this to your `index.html`:

```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

### 5. Share Your Mini App
- Share the bot link with your parking community
- Users can access the app by opening the bot and clicking "Start"
- The app will open as a Mini App within Telegram

## Integration Details

### User Authentication
The app automatically detects Telegram user information:
- User ID is used as the unique identifier
- Username is pre-filled in the profile
- No separate login required

### Telegram Features Used
- **WebApp API**: Detects user info and provides native Telegram UI features
- **Deep Links**: Opens Telegram chats directly from contact buttons
- **Haptic Feedback**: Provides tactile feedback on button presses
- **Theme Integration**: Adapts to Telegram's light/dark theme

## Testing Outside Telegram

For development and testing outside Telegram:
1. The app will generate a mock user ID
2. Telegram-specific features will gracefully fall back to web defaults
3. Contact links will open in new browser tabs

## Data Storage

All data is stored in Supabase:
- User profiles
- Parking space information
- Listings and requests
- Contact information

**Important**: This app is designed for prototyping and community use. For production deployment with sensitive data, implement additional security measures.

## Customization

### Adding to a Specific Chat
You can configure the bot to only work in specific chats by:
1. Adding bot to your private group
2. Implementing chat ID verification in the backend
3. Restricting access to authorized chat members only

### Branding
Customize the app by editing:
- Colors in `/src/app/components/` files
- App name and icon in `HomePage.tsx`
- Telegram bot profile picture and description

## Support

For issues or questions:
1. Check the backend logs in Supabase dashboard
2. Use browser console for frontend debugging
3. Test API endpoints directly using the Supabase function URLs

## Security Notes

⚠️ **Important Security Considerations**:
- Do not store sensitive payment information
- Validate all user inputs on the backend
- Implement rate limiting for API endpoints
- Use Telegram's auth validation for production deployments
- This is a prototype - add proper authentication for production use

## Next Steps

To enhance this app for production:
1. Implement proper Telegram auth validation on the backend
2. Add image upload for parking spaces
3. Implement push notifications for new listings
4. Add in-app messaging between users
5. Implement booking/reservation system
6. Add payment integration if needed
