# Garden Companion - Feature List

## Core Features

### Plant Management
- **Add Plants**: Add plants manually or via AI identification
- **Plant Database**: Integration with Perenual API for plant care information
- **Plant Details**: View comprehensive care guides, watering schedules, and plant information
- **Plant Deletion**: Remove plants from your garden
- **Plant Journal**: Track growth with notes, height measurements, and photos

### Garden Types
- **Indoor Garden**: Manage houseplants with room-based organization
- **Outdoor Garden**: Track outdoor plants with weather-aware watering

### Room Organization (Indoor)
- **Room Grouping**: Organize indoor plants by room (Living Room, Bedroom, Kitchen, Office, Bathroom, Balcony)
- **Custom Rooms**: Add and manage custom room names
- **Room Assignment**: Assign plants to specific rooms

## Smart Watering System

### Intelligent Scheduling
- **Base Watering Schedule**: Set watering frequency per plant
- **Weather-Aware Adjustments**: Automatic schedule adjustments based on weather conditions
- **Rain Detection**: Extends watering schedule when it rains (outdoor plants)
- **Temperature Adjustments**: Adjusts watering for heat (water sooner) and cold (water less)
- **Visual Status Indicators**: Color-coded status (OK, Due, Overdue)

### Watering Actions
- **Quick Water**: One-tap watering with confetti celebration
- **Snooze Feature (P4)**: Delay watering for 24 hours without guilt
- **Watering History**: Track when plants were last watered

## AI & Data Features

### P1: Real AI Integration ("True-Sight" Lens)
- **Plant.id API Integration**: Real plant identification from photos
- **Perenual API Integration**: Accurate care information and watering schedules
- **Fallback System**: Mock data if API key is missing

### P2: Backup & Restore ("Garden Key")
- **Export Garden**: Download complete garden data as JSON file
- **Import Garden**: Restore garden from backup file
- **Data Persistence**: Local storage with backup safety net

## Living UI Features

### P3: Living Card UI
- **Dynamic Avatars**: Plants show different faces based on their status
  - Happy faces (🙂 😊 😄 😌) when healthy
  - Thirsty face (😫) when water is due
  - Hot face (🥵) in high temperatures
  - Cold face (🥶) in low temperatures
  - Relaxed face (😌) after rain
  - Dead face (😵) when severely overdue
- **Weather Accessories**: Plants wear scarves (🧣) when temperature drops below 10°C
- **Animations**: 
  - Bounce animation for happy plants (on hover)
  - Pulse animation for thirsty plants
  - Tilt effect for plants needing attention

### P4: Snooze Button
- **Guilt-Free Delay**: Snooze watering for 24 hours
- **Visual Feedback**: "Snoozed 😴" status indicator
- **Automatic Clear**: Snooze clears when plant is watered

### P5: Context Calendar
- **7-Day Weather History**: Visual calendar showing past week's weather
- **Weather Icons**: Rain, sun, clouds based on conditions
- **Temperature Display**: Daily high temperatures
- **Rainfall Tracking**: Shows rainfall amounts
- **Smart Insights**: Explains why watering schedule changed

## Advanced Care Features

### P6: Growth Tape ("Progress Visualization")
- **Photo Journal**: Add timestamped photos to journal entries
- **Time Travel Slider**: Scroll through plant's growth photos
- **Stop-Motion Effect**: Watch your plant grow over time
- **Snap Button**: Quick photo capture with journal entry

### P7: Hospital Wing
- **Hospital Status**: Move struggling plants to "Hospital" instead of deleting
- **Triage Checklist**: 
  - Check roots?
  - Check for pests?
  - Repotted if needed?
- **Recovery Mode**: Pauses standard watering schedule
- **Discharge Celebration**: Confetti when plant recovers
- **Survivor Badge**: Plants that recovered get special recognition

### P8: Pet Profiles ("Custom Profiles")
- **Nicknames**: Give plants personalized names (e.g., "Sir Photosynthesize")
- **Gotcha Day**: Track when you got the plant
- **Age Calculation**: Automatic age tracking in days
- **Pot Type Selection**: Track pot type (Terracotta, Ceramic, Plastic, Hanging)
- **Emotional Attachment**: Reduces likelihood of app deletion

### P9: Seasonal Shift Alerts
- **Season Detection**: Automatic season identification based on month
- **Seasonal Guidance**:
  - **Winter**: "Days are shorter. Reduce watering for most plants."
  - **Spring**: "Wakey wakey! Time to fertilize and check for growth."
  - **Summer**: "It's hot! Check soil moisture daily."
  - **Autumn**: "Prepare for dormancy. Reduce fertilizer."
- **Dismissible Alerts**: Close seasonal banners when acknowledged

### P10: Share Card ("Social Bragging")
- **Beautiful Card Generation**: Create shareable plant cards
- **Card Contents**:
  - Plant photo
  - Name & species
  - Age in days
  - Watering frequency
  - Location/sunlight needs
  - "Survivor" badge if recovered from hospital
- **Image Export**: Download as PNG for social media sharing
- **Premium Design**: Gradient backgrounds with modern styling

## Weather Integration

### Current Weather
- **Real-Time Data**: Fetches local weather via geolocation
- **Temperature Display**: Current temperature
- **Weather Icons**: Visual weather representation
- **Rain Detection**: Tracks recent rainfall

### Historical Weather
- **7-Day History**: Past week's weather data
- **Temperature Trends**: Track temperature changes
- **Rainfall Totals**: Cumulative rainfall tracking
- **Smart Adjustments**: Uses history for watering decisions

## User Interface

### Navigation
- **Garden Switcher**: Toggle between Indoor and Outdoor gardens
- **Settings Access**: Quick access to backup/restore
- **Clean Design**: Modern, minimalist interface

### Visual Design
- **Glass Morphism**: Modern glass-panel effects
- **Smooth Animations**: Fade-in, bounce, pulse effects
- **Color-Coded Status**: Intuitive status indicators
- **Responsive Layout**: Works on all screen sizes

### Interactions
- **Confetti Celebrations**: Visual feedback for positive actions
- **Hover Effects**: Interactive card animations
- **Modal Dialogs**: Clean, focused detail views
- **Toast Notifications**: Non-intrusive alerts

## Data & Storage

### Local Storage
- **Automatic Saving**: All changes saved immediately
- **Plant Data**: Complete plant information
- **Room Configuration**: Custom room settings
- **Persistent State**: Survives browser refreshes

### Export/Import
- **JSON Format**: Standard, readable data format
- **Version Tracking**: Backup file versioning
- **Date Stamping**: Export date included
- **Complete Backup**: All plants and rooms included

## Technical Features

### APIs & Services
- **Plant.id API**: Plant identification
- **Perenual API**: Plant care database
- **Open-Meteo API**: Weather data
- **Geolocation**: Automatic location detection

### Performance
- **Lazy Loading**: Efficient data fetching
- **Optimized Images**: Image optimization
- **Fast Rendering**: Smooth UI performance
- **Minimal Dependencies**: Lightweight bundle

## Future Enhancements (Potential)

- Multi-device sync
- Push notifications for watering reminders
- Community features (share plants with friends)
- Plant disease detection
- Fertilizer tracking
- Pest management
- Growth predictions
- Plant marketplace integration

---

**Total Implemented Features**: 10 Major Feature Sets (P1-P10)
**Last Updated**: December 17, 2025
