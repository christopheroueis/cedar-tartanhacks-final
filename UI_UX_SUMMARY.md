# ClimateCredit - UI/UX & User Flow Summary

## Design Philosophy

### Visual Aesthetics
- **Dark Theme:** Gradient backgrounds (slate-900 → indigo-900 → purple-900)
- **Glassmorphism:** Frosted glass effects with backdrop blur and transparency
- **Vibrant Accents:** Teal, purple, violet gradients for CTAs and active states
- **Smooth Animations:** Transitions, hover effects, pulsing icons, floating particles
- **Modern Typography:** Clean, bold headers with clear hierarchy

### Design Principles
- **Progressive Disclosure:** Multi-step flow prevents overwhelming users
- **Visual Feedback:** Loading states, progress indicators, success confirmations
- **Accessibility:** High contrast, clear labels, mobile-responsive
- **Premium Feel:** Polished animations and high-end visual effects

---

## Complete User Flow

```
┌─────────────┐
│   Login     │ → Username/Password authentication
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Dashboard  │ → Portfolio overview (Manager only)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ New Assessment   │ → Start loan evaluation
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│         STEP 1: Mode Selection                   │
│  • AI Assistant (voice/text → auto-extract)     │
│  • Manual Entry (traditional form)               │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│      STEP 2: Location Detection                  │
│  ┌───────────┬───────────┐                       │
│  │    GPS    │  Manual   │                       │
│  │  Detect   │  Search   │                       │
│  └───────────┴───────────┘                       │
│  • GPS: Browser geolocation                      │
│  • Manual: Autocomplete address search           │
│  • Confirmation: Show coordinates & address      │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│      STEP 3: Loading Animation (6-7s)            │
│  📊 Analyzing economic indicators...             │
│  🌡️  Fetching climate patterns...                │
│  ⚠️  Assessing conflict risk...                  │
│  👥 Loading social metrics...                    │
│  [Progress: ████████████████ 100%]               │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│         STEP 4: Data Entry                       │
│                                                  │
│  ┌─ IF AI ASSISTANT ─┐   ┌─ IF MANUAL ─┐       │
│  │ • Voice recording  │   │ • Fill form  │       │
│  │ • Or type/paste    │   │ • Input all  │       │
│  │   transcript       │   │   fields     │       │
│  │ • "Extract Data"   │   │ • Validation │       │
│  │ • Review/edit      │   │              │       │
│  └────────────────────┘   └──────────────┘       │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│      STEP 5: Risk Assessment (Processing)        │
│  • ML model calculates default probability      │
│  • Climate risk score computed                   │
│  • Conflict data integrated                      │
│  • Economic indicators factored in               │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────┐
│           STEP 6: Results                        │
│  ┌─────────────────────────────────────┐         │
│  │ Overall Risk Score: [0-100]         │         │
│  │ Recommendation: Approve/Review/Deny │         │
│  ├─────────────────────────────────────┤         │
│  │ Climate Risk: [Low/Medium/High]     │         │
│  │ Default Probability: [ML Score]     │         │
│  │ Suggested Loan Terms                │         │
│  │ Risk Mitigation: Insurance, etc.    │         │
│  └─────────────────────────────────────┘         │
└────────┬─────────────────────────────────────────┘
         │
         ▼
┌─────────────┐
│   History   │ → View past assessments
└─────────────┘
```

---

## Progress Indicator

Throughout steps 2-6, a persistent progress bar shows:

```
[●] Location  →  [○] Data Entry  →  [○] Assessment  →  [○] Results
```

- **Active:** Glowing purple with pulse animation
- **Completed:** Green checkmark
- **Future:** Dimmed gray

---

## Key UI Components

### 1. Mode Selection Card
- **Layout:** 2-column grid (AI vs Manual)
- **Visual:** Glassmorphism cards with hover scale effect
- **Icons:** Sparkles (AI) vs Pen (Manual)

### 2. Location Detection
- **Dual Options:** GPS button + Search input
- **Autocomplete:** Real-time suggestions from Nominatim
- **Confirmation:** Card with map pin, address, coordinates

### 3. Loading Screen
- **Background:** Animated gradient + floating particles
- **Center:** Large circular icon changing per metric
- **Progress:** Linear bar (0-100%) + percentage display
- **Text:** Sequential animated messages

### 4. AI Recording Interface
- **Microphone Button:** Large circular with animation
- **Transcript Box:** Editable textarea with word count
- **Extract Button:** Appears when transcript has content
- **Fallback:** Manual typing always available

### 5. Results Dashboard
- **Score Card:** Large centered risk score with color coding
- **Breakdown:** Tabbed sections (Climate, ML, Conflict)
- **Recommendations:** Actionable suggestions
- **Export:** Download report option

---

## Responsive Design

### Mobile (< 768px)
- Single column layout
- Stacked cards
- Full-width buttons
- Simplified progress bar

### Desktop (≥ 768px)
- Multi-column grids
- Side-by-side options
- Enhanced animations
- Full progress stepper

---

## Color System

| Element | Colors |
|---------|--------|
| Background | `from-slate-900 via-indigo-900 to-purple-900` |
| Primary CTA | `from-violet-500 to-purple-600` |
| Success | `from-green-500 to-emerald-600` |
| Warning | `from-orange-500 to-red-500` |
| Glass Cards | `bg-white/10 backdrop-blur-lg border-white/20` |
| Text Primary | `text-white` |
| Text Secondary | `text-slate-300` |

---

## Interaction Patterns

### Buttons
- **Hover:** Scale slightly, brighten colors
- **Active:** Scale down (`scale-[0.98]`)
- **Disabled:** 50% opacity, no pointer events

### Cards
- **Hover:** Slight scale-up (`hover:scale-105`)
- **Selected:** Ring effect with glow

### Loading States
- **Spinner:** `Loader2` icon with spin animation
- **Progress:** Smooth CSS transitions
- **Skeleton:** Pulsing placeholder elements

---

## User Feedback Mechanisms

1. **Visual Confirmations:** Checkmarks, color changes, success cards
2. **Error Handling:** Alert icons with descriptive messages
3. **Loading Indicators:** Spinners, progress bars, animated text
4. **Tooltips:** Contextual help on hover
5. **Confidence Scores:** AI extraction shows high/medium/low confidence

---

## Accessibility Features

- **Keyboard Navigation:** All interactive elements focusable
- **ARIA Labels:** Descriptive labels for screen readers
- **Color Contrast:** WCAG AA compliant
- **Error Messages:** Clear, actionable text
- **Mobile Touch:** 44px minimum touch targets

---

## Performance Optimizations

- **Lazy Loading:** Components load on demand
- **Debouncing:** Address search waits 500ms after typing
- **Rate Limiting:** Nominatim API (1 req/sec)
- **Minimum Loading:** 6s display ensures smooth UX (prevents flashing)
