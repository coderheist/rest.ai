# Candidate Management & Shortlisting System

## Overview
The redesigned Candidate Pool page (`TalentPoolNew.jsx`) provides a comprehensive workflow for processing resumes and managing candidates through the recruitment pipeline.

## Key Features

### 1. **Dashboard Statistics**
5 key metrics displayed at the top:
- **Total Candidates**: Total number of resumes in the system
- **New**: Unreviewed candidates requiring attention
- **Reviewed**: Candidates that have been evaluated
- **Shortlisted**: Candidates moved to shortlist
- **Interview**: Candidates scheduled for interviews

### 2. **Advanced Search & Filtering**

#### Quick Search
- Search by candidate name, email, or skills
- Real-time filtering as you type
- Searches across multiple fields simultaneously

#### Advanced Filters (Toggle Panel)
- **Status Filter**: Filter by candidate status (New, Reviewed, Shortlisted, Interview, Offer, Rejected)
- **Experience Level**: 0-2, 3-5, 6-10, 10+ years
- **Min Score Slider**: Filter by ATS match score (0-100%)
- **Job Assignment**: Show candidates assigned to specific jobs
- **Clear All**: Reset all filters with one click

#### Sorting Options
- **Recent First**: Latest uploads first (default)
- **Highest Score**: Sort by ATS match score descending
- **Name (A-Z)**: Alphabetical order
- **Most Experience**: Sort by years of experience

### 3. **View Modes**

#### Grid View
- Card-based layout showing 3 candidates per row
- Visual emphasis on key information
- Quick action buttons on each card
- Best for visual scanning and quick reviews

#### List View
- Compact table-like layout
- Shows more candidates at once
- Side-by-side comparison friendly
- Best for power users processing high volumes

### 4. **Bulk Selection & Actions**

#### Selection Features
- **Select All**: Toggle to select/deselect all filtered candidates
- **Individual Selection**: Checkbox on each candidate card
- **Selection Counter**: Shows "X selected" in blue badge
- **Persistent Selection**: Selections maintained while filtering

#### Bulk Operations
Once candidates are selected, perform bulk actions:
- **Mark as Reviewed**: Move candidates to reviewed status
- **Shortlist**: Add to shortlist for further evaluation
- **Move to Interview**: Schedule for interview stage
- **Assign to Job**: Match candidates with job openings
- **Reject**: Mark candidates as rejected
- **Delete**: Remove candidates from system (with confirmation)

### 5. **Candidate Cards (Grid View)**

Each card displays:
- **Checkbox**: For bulk selection
- **Name**: Links to detailed profile
- **Email & Phone**: Contact information
- **Location**: Current location
- **Experience**: Total years calculated from work history
- **ATS Score**: Color-coded match percentage
  - 🟢 Green (80-100%): Excellent match
  - 🟡 Yellow (60-79%): Good match
  - 🔴 Red (<60%): Weak match
- **Status Badge**: Current workflow stage with color coding
- **Top 3 Skills**: Most relevant skills with "+" indicator for more
- **Quick Actions Menu**: 
  - View Full Profile
  - Shortlist
  - Reject
  - Download Resume
  - Add Note

### 6. **Status Workflow**

Candidates progress through these stages:
1. **New** (Blue): Freshly uploaded, awaiting review
2. **Reviewed** (Purple): Evaluated by recruiter
3. **Shortlisted** (Yellow): Selected for further consideration
4. **Interview** (Indigo): Scheduled for interviews
5. **Offer** (Green): Offer extended
6. **Hired** (Dark Green): Successfully hired
7. **Rejected** (Red): Not suitable for position

### 7. **Job Assignment Modal**

When assigning candidates to jobs:
- Select multiple candidates using bulk selection
- Click "Assign to Job" in bulk actions
- Modal shows all active job openings
- Click on job to assign all selected candidates
- System automatically calculates match scores

### 8. **Color Coding System**

#### Status Colors
- **New**: Blue (#2563eb)
- **Reviewed**: Purple (#7c3aed)
- **Shortlisted**: Yellow (#f59e0b)
- **Interview**: Indigo (#4f46e5)
- **Offer**: Green (#10b981)
- **Hired**: Dark Green (#047857)
- **Rejected**: Red (#ef4444)

#### Score Colors
- **80-100%**: Green background (Strong match)
- **60-79%**: Yellow background (Good match)
- **0-59%**: Red background (Weak match)

## User Workflow Examples

### Example 1: Processing New Resumes
1. Navigate to Candidates page
2. Filter by Status = "New"
3. Review each candidate card
4. For qualified candidates:
   - Click "Shortlist" in action menu OR
   - Select multiple and use bulk "Shortlist" action
5. For unqualified candidates:
   - Click "Reject" OR
   - Bulk select and reject

### Example 2: Finding Candidates for a Job
1. Click "Filters" to expand advanced filters
2. Select specific job from "Job" dropdown
3. Set "Min Score" to 70% for quality candidates
4. Sort by "Highest Score"
5. Review top matches
6. Bulk select best candidates
7. Click "Move to Interview"

### Example 3: Shortlisting by Skills
1. Use search bar to search for specific skill (e.g., "React")
2. Set experience filter (e.g., "3-5 years")
3. Review filtered candidates
4. Select candidates with matching profiles
5. Assign to relevant job opening

### Example 4: Cleaning Up Database
1. Filter by Status = "Rejected"
2. Set date range to old candidates (if implemented)
3. Select All
4. Click bulk "Delete"
5. Confirm deletion

## Technical Implementation

### State Management
- **candidates**: All candidates from API
- **filteredCandidates**: Filtered and sorted subset
- **selectedIds**: Array of selected candidate IDs
- **filters**: Object containing all filter values
- **sortBy**: Current sort method
- **viewMode**: 'grid' or 'list'

### API Calls
- `resumeAPI.getResumes()`: Fetch all candidates
- `resumeAPI.getStats()`: Fetch statistics
- `resumeAPI.updateStatus(id, status)`: Update candidate status
- `resumeAPI.deleteResume(id)`: Delete candidate
- `matchAPI.calculateMatch(jobId, resumeId)`: Create job match
- `jobAPI.getJobs()`: Fetch jobs for assignment

### Performance Optimizations
- Filters applied client-side for instant feedback
- Lazy loading for large candidate lists (future enhancement)
- Debounced search input (future enhancement)
- Memoized filter functions (future enhancement)

## Future Enhancements

### Phase 2 Features
- **Drag & Drop**: Drag candidates between status columns
- **Kanban Board**: Visual pipeline view
- **Quick Preview**: Resume preview panel without navigation
- **Comparison Mode**: Side-by-side candidate comparison
- **Notes System**: Add private notes to candidates
- **Tags**: Custom tags for categorization
- **Email Integration**: Send bulk emails to candidates
- **Calendar Integration**: Schedule interviews directly

### Phase 3 Features
- **AI Recommendations**: Smart candidate suggestions
- **Auto-categorization**: Automatic status updates based on actions
- **Duplicate Detection**: Find and merge duplicate candidates
- **Advanced Analytics**: Funnel metrics and conversion rates
- **Export to CSV**: Export filtered candidate lists
- **Import from LinkedIn**: Direct LinkedIn integration

## Best Practices

### For Recruiters
1. **Daily Review**: Check "New" candidates daily
2. **Use Filters**: Leverage filters to find specific profiles quickly
3. **Bulk Operations**: Process multiple candidates at once to save time
4. **Status Hygiene**: Keep statuses updated for accurate pipeline view
5. **Score Awareness**: Pay attention to ATS scores for initial screening

### For Hiring Managers
1. **Focus on Shortlisted**: Review only shortlisted candidates
2. **High Score Priority**: Sort by score to see best matches first
3. **Job-Specific View**: Filter by specific job opening
4. **Quick Actions**: Use action menu for rapid decisions

### For Admins
1. **Regular Cleanup**: Remove old rejected candidates monthly
2. **Monitor Stats**: Track pipeline metrics in dashboard
3. **Bulk Assignments**: Use bulk job assignment for efficiency
4. **Filter Combinations**: Combine multiple filters for precise targeting

## Keyboard Shortcuts (Future)
- `Ctrl+A`: Select all
- `Ctrl+D`: Deselect all
- `S`: Shortlist selected
- `R`: Reject selected
- `I`: Move to interview
- `Ctrl+F`: Focus search
- `G`: Toggle grid view
- `L`: Toggle list view

## Mobile Responsiveness
- Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop
- Collapsible filters for mobile
- Touch-friendly action buttons
- Swipe actions (future enhancement)

## Accessibility
- Keyboard navigation support
- ARIA labels on interactive elements
- Screen reader friendly
- High contrast mode compatible
- Focus indicators on all interactive elements

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Component**: `TalentPoolNew.jsx`  
**Route**: `/talent-pool`
