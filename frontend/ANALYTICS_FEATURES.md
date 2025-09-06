# Donor Dashboard Analytics Features

The Donor Dashboard now includes comprehensive analytics powered by Chart.js to provide donors with detailed insights into their impact and the overall project status.

## 📊 Analytics Components

### 1. **Your Donation Distribution (Pie Chart)**
- **Purpose**: Shows how the current user has distributed their donations across different projects
- **Data Source**: Real-time data from `FundContract.donations` mapping
- **Features**:
  - Interactive pie chart with hover effects
  - Color-coded segments for each project
  - Real-time updates when new donations are made
  - Responsive design for all screen sizes

### 2. **Total Project Donations (Pie Chart)**
- **Purpose**: Displays the overall donation distribution across all projects from all donors
- **Data Source**: Real-time data from `FundContract.projectDonations` mapping
- **Features**:
  - Shows total community impact
  - Helps users understand which projects are most popular
  - Updates automatically as new donations come in
  - Color-coded to match user's donation chart

### 3. **Top Donors (Bar Chart)**
- **Purpose**: Highlights the most active donors in the community
- **Data Source**: Mock data (in production, would come from contract events/API)
- **Features**:
  - Horizontal bar chart for easy comparison
  - Shows donation amounts in USDC
  - Anonymized donor names for privacy
  - Motivates community participation

### 4. **Milestone Release Progress (Progress Bars)**
- **Purpose**: Tracks how much funding has been released vs. available for each project
- **Data Source**: Real-time calculation from `totalDonations - availableFunds`
- **Features**:
  - Animated progress bars with smooth transitions
  - Percentage completion display
  - Shows released vs. available funds
  - Color-coded progress indicators

### 5. **Project Overview Cards**
- **Purpose**: Detailed breakdown of each project's financial status
- **Data Source**: Real-time contract data
- **Features**:
  - Total raised amount
  - Available funds for new proposals
  - Released funds (milestones completed)
  - Progress percentage
  - Clean card-based layout

## 🎨 Visual Design

### Color Scheme
- **Primary Blue**: `#3B82F6` - Education projects
- **Green**: `#10B981` - Healthcare projects  
- **Orange**: `#F59E0B` - Environmental projects
- **Red**: `#EF4444` - Food Security projects
- **Purple**: `#8B5CF6` - Additional elements

### Chart Styling
- **Responsive Design**: Charts adapt to all screen sizes
- **Interactive Tooltips**: Hover effects with detailed information
- **Smooth Animations**: Progress bars animate on load
- **Consistent Branding**: Matches Valenor's design system

## 📱 Responsive Layout

### Desktop (lg+)
- 2-column grid layout for charts
- Side-by-side comparison of user vs. total donations
- Full-width progress bars and project overview

### Tablet (md)
- Single column layout with stacked charts
- Maintains readability and interactivity
- Optimized spacing for touch interaction

### Mobile (sm)
- Single column layout
- Touch-friendly chart interactions
- Condensed but readable progress indicators

## 🔄 Real-time Updates

### Data Sources
All analytics pull from live contract data:

```typescript
// User's individual donations
const { data: project1Donation } = getDonation(address, 1)

// Total project donations
const { data: totalProject1Donations } = getProjectDonations(1)

// Available funds for proposals
const { data: project1Available } = getProjectAvailable(1)
```

### Update Triggers
- **New Donations**: Charts update immediately after transaction confirmation
- **Milestone Releases**: Progress bars update when proposals are executed
- **Page Refresh**: All data refreshes from contract state

## 📈 Analytics Calculations

### Milestone Progress Formula
```typescript
const getMilestoneProgress = (totalDonations, available) => {
  if (!totalDonations || totalDonations === 0n) return 0
  if (!available) return 0
  const released = totalDonations - available
  return Math.round((Number(released) / Number(totalDonations)) * 100)
}
```

### Chart Data Processing
```typescript
// Convert BigInt to formatted strings for display
const formatUSDC = (amount: bigint | undefined): string => {
  if (!amount) return '0'
  return formatUnits(amount, 6)
}

// Convert to numbers for Chart.js
const chartData = parseFloat(formatUSDC(projectDonation || 0n))
```

## 🎯 User Experience Features

### Interactive Elements
- **Hover Effects**: Charts show detailed information on hover
- **Click Interactions**: Progress bars are clickable for more details
- **Loading States**: Smooth loading animations for data fetching
- **Error Handling**: Graceful fallbacks when data is unavailable

### Accessibility
- **Color Contrast**: Meets WCAG guidelines
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **High Contrast Mode**: Charts adapt to system preferences

## 🔧 Technical Implementation

### Chart.js Configuration
```typescript
const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    title: {
      display: true,
      text: 'Your Donation Distribution',
    },
  },
}

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Top Donors' },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          return value.toLocaleString() + ' USDC'
        }
      }
    }
  }
}
```

### Data Flow
1. **Contract Queries**: Use wagmi hooks to fetch contract data
2. **Data Processing**: Convert BigInt values to displayable formats
3. **Chart Rendering**: Pass processed data to Chart.js components
4. **Real-time Updates**: React Query handles caching and refetching

## 🚀 Performance Optimizations

### Caching Strategy
- **React Query**: Automatic caching of contract data
- **Background Refetching**: Updates data without user interaction
- **Optimistic Updates**: UI updates immediately on user actions

### Chart Performance
- **Lazy Loading**: Charts only render when visible
- **Data Limiting**: Top donors limited to 5 for performance
- **Smooth Animations**: CSS transitions for better performance

## 📊 Future Enhancements

### Planned Features
- **Time-based Analytics**: Historical donation trends
- **Comparative Analysis**: User vs. community averages
- **Export Functionality**: Download charts as images/PDFs
- **Advanced Filtering**: Filter by date range, project type
- **Real-time Notifications**: Alerts for milestone completions

### Data Sources
- **Event Logs**: Parse contract events for historical data
- **External APIs**: Integration with blockchain explorers
- **User Preferences**: Customizable dashboard layouts
- **Social Features**: Share achievements and milestones

## 🎨 Customization Options

### Chart Themes
- **Light/Dark Mode**: Automatic theme switching
- **Color Blind Support**: Alternative color palettes
- **Custom Colors**: User-defined project colors
- **Chart Types**: Switch between pie, bar, and line charts

### Layout Options
- **Grid Size**: Adjustable chart grid layouts
- **Widget Order**: Drag-and-drop dashboard customization
- **Compact Mode**: Condensed view for mobile
- **Full Screen**: Expand charts for detailed analysis

The enhanced analytics provide donors with comprehensive insights into their impact and the overall health of the Valenor ecosystem, encouraging continued participation and transparency in the decentralized social fund.

