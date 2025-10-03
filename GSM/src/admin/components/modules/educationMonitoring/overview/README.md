# Education Monitoring - Overview Module

This module contains the main dashboard components for the Education Monitoring system.

## Components

- **EMROverview.jsx** - Main dashboard container that orchestrates all child components
- **DashboardHeader.jsx** - Header section with live status indicator and action buttons
- **KPICards.jsx** - Statistics cards displaying key performance indicators
- **ReportCategories.jsx** - Category filtering component for reports
- **ReportsList.jsx** - Reports display component with filtering capabilities

## Features

- Real-time data refresh (5-minute intervals)
- Interactive KPI cards with trend indicators
- Category-based report filtering
- Responsive design
- Live status indicators
- Export functionality

## Usage

```jsx
import { EMROverview } from "./overview";

<EMROverview />;
```
