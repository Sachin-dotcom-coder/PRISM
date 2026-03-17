# Antigravity Execution Script: PRISM 2026 Sports Hero Page

## Step 1: Global Document Setup & Theming
* Initialize a new webpage canvas.
* Set the global background color to Absolute Deep Black (`#000000`). Ensure no gradients, lighter greys, or image overlays obscure this base layer.
* Define the global accent color as Vibrant Amber Yellow.
* Define the global neutral/inactive text color as Crisp White (`#FFFFFF`).
* Set the global font-family for standard body text and UI links to a clean, modern sans-serif (e.g., Inter, Roboto, or Montserrat).
* Ensure all layout containers utilize Flexbox or CSS Grid to maintain a sleek, uniform, and structurally sound layout with zero bulky elements.

## Step 2: Top Taskbar Navigation Build
* Create a fixed header pinned to the top edge of the viewport (`width: 100%`, `position: fixed`, `z-index: 100`).
* Set the header background to fully transparent.
* **Left Hemisphere (Hamburger):** Insert a minimalist UI icon consisting of exactly three horizontal lines (em dashes: `—`). This will act as the dropdown menu trigger. Align it to the far left with appropriate padding.
* **Center Hemisphere (Links):** Create a flex-container aligned dead center. Add three text links: `Live Scores`, `Leaderboard`, and `Department`. Use lowercase, white, modern sans-serif text. Apply equal, spacious padding between each word.

## Step 3: Hover Interactions & Micro-Animations (Global Rule)
* Select all interactive UI elements in the taskbar (the Hamburger icon, the center links, and the search bar).
* Apply a smooth CSS transition to these elements (`transition: all 0.3s ease-in-out`).
* **Hover Logic:** Define the `:hover` state for these elements:
    * **Levitation:** The element must smoothly scale up by exactly 3% to 5% (`transform: scale(1.04)`). Ensure this scaling does not push or shift adjacent elements.
    * **Color Shift:** The text, icon, and search underline must seamlessly change from White to Amber Yellow while hovered.

## Step 4: The Live Score Ticker Component (Bonus Feature)
* Immediately below the main top taskbar, inject a full-width horizontal ticker strip.
* Set the strip background to a highly translucent dark grey/black (`rgba(20, 20, 20, 0.6)`) to separate it slightly from the deep black background.
* Populate the ticker with a continuous, infinitely scrolling text animation (marquee style) moving right to left.
* **Ticker Content & Formatting:** Use a small, crisp font. Inject live sports score placeholders. Alternate between White text and Amber Yellow highlights for the scores. 
    * *Example injection data:* `FOOTBALL : ECE VS CSE | 78' | 2 - 1` • `CRICKET : AI vs MECH | 14.2 Ov | 134/4` • `BASKETBALL : CHE vs EEE | Q4 2:12 | 102 - 98`

## Step 5: Hero Page Core Content (PRISM 2026)
* Create a main hero container occupying the center of the viewport (`height: 100vh`).
* Set display to Flexbox, align-items center, justify-content center.
* **Main Heading Text:** Inject the text "PRISM 2026" exactly in the dead center of the screen.
* **Typography Constraints:** Render this specific text using the **Triton** font (or the absolute closest aggressive, bold, angular sports equivalent available in the system).
* **Sizing:** Scale the text to be massive, dominating the visual hierarchy of the page.
* **Color & Shadow:** Set the text color to Vibrant Amber Yellow. Apply a smooth, sleek drop shadow (`text-shadow: 0px 10px 30px rgba(255, 191, 0, 0.3)`) to give the massive text depth against the black background.

## Step 6: Ambient Sports Animation (Background Effects)
* Render a subtle, sleek ambient animation positioned directly behind the "PRISM 2026" text (lower z-index).
* **Visual Profile:** Generate a 3D wireframe sports element (such as a basketball or stadium geometry) composed entirely of thin, glowing Amber Yellow light trails.
* **Motion Logic:** Set the wireframe animation to slowly and continuously rotate or pulse. It must remain dark and translucent enough that it does not overpower the readability of the main "PRISM 2026" heading.

## Step 7: Call to Action (CTA) Button
* Position a button directly below the massive "PRISM 2026" heading.
* **Text Content:** `[ LIVE SCORES & SCHEDULES ]` (Use white text, small modern sans-serif, with slight letter-spacing).
* **Styling:** Transparent background with a crisp, thin Amber Yellow border.
* **Interaction:** Apply the universal hover rule from Step 3. On hover, the button must scale up 3-5%, the text must shift to Amber Yellow, and it must emit a very soft Amber Yellow box-shadow glow.

------ phase 2 ------

# Antigravity Execution Script: PRISM 2026 Core Content (Phase 2)

## Step 8: Teams Section Initialization & Transition
* **Objective:** Create a seamless spatial transition from the massive 100vh hero section into the scrolling content.
* **Container Setup:** Initialize a new block-level element (`<div>` or `<section>`) immediately following the Hero Page.
* **Properties:** * `height: auto`
  * `position: relative`
* **Theming:** Inherit the global Absolute Deep Black (`#000000`) background. 
* **Spacing:** Apply generous vertical padding (`padding: 8vh 0`) to act as a visual breather before introducing new high-motion elements.

## Step 9: Section Heading ("TEAMS")
* **Objective:** Establish clear content hierarchy with a minimalist, aggressive header.
* **Injection:** Place an `<h2>` or equivalent heading tag centered above the infinite scroll track.
* **Text Content:** `TEAMS`
* **Typography & Styling:** * Font: Global modern sans-serif (e.g., Inter or Montserrat).
  * Weight: Bold / `800`.
  * Transformation: Uppercase.
  * Spacing: Heavy letter-spacing (`letter-spacing: 0.3em`) for a wide, cinematic look.
  * Color: Vibrant Amber Yellow (`#FFBF00`).

## Step 10: Infinite Scroll Track (The Marquee Container)
* **Objective:** Build the structural runway for the looping department text.
* **Track Setup:** Create a full-width wrapper (`width: 100vw`).
* **Overflow Handling:** Force linear scrolling by hiding vertical spillage (`overflow-x: hidden`) and preventing text wrapping (`white-space: nowrap`).
* **The "Participation Line":** Frame the track with thin, glowing borders. 
  * `border-top: 1px solid rgba(255, 191, 0, 0.3)`
  * `border-bottom: 1px solid rgba(255, 191, 0, 0.3)`
* **Vignette Effect:** Apply a soft, dark CSS linear-gradient mask on the extreme left and right edges. This ensures the scrolling text fades smoothly into the shadows rather than clipping harshly at the screen edge.

## Step 11: Department Population & Motion Logic
* **Objective:** Inject the participating factions and initialize the continuous movement.
* **Flex Layout:** Inside the marquee track, set up a Flexbox container (`display: flex`, `align-items: center`) to hold the text nodes.
* **Data Injection:** Populate the track with the precise string of departments: `ECE`, `CSE`, `AI`, `MECH`, `CHE`, `CE`, `EE`, `SCI`, `MBA`.
* **Separators:** Inject a sleek visual divider between every department name. Use a geometric forward slash (` / `) or a solid bullet (` • `) styled in Vibrant Amber Yellow to denote participation.
* **The Infinite Loop:** Duplicate the entire text string within the DOM to prevent blank rendering gaps. Apply a continuous CSS animation (`animation: slide-left 25s linear infinite`).

## Step 12: Team Typography & Micro-Interactions
* **Objective:** Make the marquee interactive and responsive to user focus.
* **Base Typography:** Set the base color of all department names to Crisp White (`#FFFFFF`). Use a substantial size (`font-size: 3rem`) and heavy weight (`font-weight: 800`).
* **Track Hover Logic:** When a user's cursor enters the track area, smoothly pause the marquee (`animation-play-state: paused`) to allow for reading.
* **Element Hover Logic (Universal Rule):** When the cursor hits a specific department:
  * Scale up smoothly (`transform: scale(1.05)`).
  * Shift color from Crisp White to Vibrant Amber Yellow.
  * Emit a soft text-shadow glow (`text-shadow: 0px 0px 15px rgba(255, 191, 0, 0.5)`).

## Step 13: The Department Leaderboard (Data Grid)
* **Objective:** Display current standings in a clean, high-tech grid format without bulky borders.
* **Container Setup:** Create a new block-level section with standard padding (`padding: 8vh 5vw`).
* **Heading:** Inject `CURRENT STANDINGS` (aligned left, bold, uppercase, Amber Yellow).
* **Grid Architecture:** Construct a CSS Grid layout (`display: grid`, `grid-template-columns: 2fr 1fr 1fr 1fr 1fr`).
* **Header Row:** Title the columns: `TEAM`, `PLAYED`, `WON`, `LOST`, `POINTS`. 
  * Style with small text (`0.85rem`), Crisp White, muted opacity (`opacity: 0.6`), and a solid 1px Amber Yellow bottom border.
* **Data Rows:** Populate with the departments. Set ECE at the absolute top of the table as the Rank 1 placeholder. Give this leading row a subtle left-border highlight (`border-left: 3px solid #FFBF00`) to denote first place.
* **Row Hover Interactions:** Base state is deep black. On hover, shift the specific row's background to a faint amber wash (`background: rgba(255, 191, 0, 0.05)`) and bump text opacity to 100%.

## Step 14: Prime Fixtures (High-Stakes Matchup Cards)
* **Objective:** Highlight key upcoming games using premium, interactive cards.
* **Heading:** Inject `PRIME FIXTURES` (aligned left, matching the Leaderboard heading).
* **Layout:** Use CSS Grid/Flexbox to display a horizontal row of matchup cards (stacking vertically on mobile).
* **Card Base Styling:**
  * Background: Translucent deep grey (`rgba(20, 20, 20, 0.4)`).
  * Border: 1px solid ultra-dark grey (`#1A1A1A`).
  * Radius: Sleek, minimal rounding (`4px`).
* **Internal Card Architecture:**
  * **Top Bar:** Sport category (e.g., `FOOTBALL` or `CRICKET`) in tiny, widely spaced Amber Yellow tracking text.
  * **Center Body (3-Column Flex):** * Left: Team 1 (e.g., `ECE`) in large, bold Crisp White.
    * Center: A glowing Amber Yellow `VS`.
    * Right: Team 2 (e.g., `CSE`) in large, bold Crisp White.
  * **Bottom Bar:** Match time/venue (e.g., `18:00 HRS | MAIN GROUND`) in muted white text.
* **Card Hover Interaction:** On hover, elevate the card (`transform: translateY(-5px)`), ignite the border to Vibrant Amber Yellow, and cast a soft, warm drop shadow.

------ phase 3 ------

# Antigravity Execution Script: PRISM 2026 Hero Page Polish (Phase 3)

## Step 15: Main Typography Enhancement (PRISM 2026 Title)
* **Objective:** Evolve the flat yellow text into a dynamic, physical light source.
* **Color & Gradient:** Replace the solid color with a subtle vertical CSS linear-gradient (`background: linear-gradient(180deg, #FFDF73 0%, #FFBF00 100%)`). Clip the background to the text (`-webkit-background-clip: text; -webkit-text-fill-color: transparent;`).
* **Depth & Bevel:** Inject a tight, bright inner shadow to create a 3D beveled edge effect.
* **Glow Expansion:** Increase the outer spread of the text-shadow so the light bleeds naturally and aggressively into the deep black background, mimicking high-voltage neon.

## Step 16: Primary Call-to-Action (CTA) Evolution
* **Objective:** Transform the static date/venue box into an aggressive, clickable sports CTA.
* **Geometry:** Discard the perfect rectangle. Apply a CSS `clip-path` to the container to create chamfered (angled) edges for a sleek, technical sports aesthetic (`clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)`).
* **Button Injection:** Keep the "SVNIT, SURAT / 30 - 31 MARCH" text small and muted, but immediately below it, inject a primary interactive button.
* **Button Content & Style:** Text reads `[ ENTER THE ARENA ]`. Use a transparent background, a solid 1px Amber Yellow border, and apply the universal hover rule (scale up, border glows, text brightens).

## Step 17: Atmospheric Depth & Particle Injection (Background)
* **Objective:** Eliminate the "empty void" feeling by adding environmental depth and passive motion.
* **Cinematic Vignette:** Apply a soft, dark radial gradient over the entire viewport background (`background: radial-gradient(circle at center, transparent 40%, #000000 100%)`) to focus the user's eye dead center on the PRISM text.
* **Particle System:** Implement a lightweight CSS or Canvas particle system behind all foreground elements (low z-index).
* **Particle Logic:** Render faint, slow-moving "sparks" or glowing amber dust floating upwards to mimic the atmosphere of a stadium under heavy floodlights. Keep opacity very low (`0.1` to `0.3`) to prevent distraction.

## Step 18: Silhouette Motion & Impact Dynamics
* **Objective:** Add kinetic energy to the static player silhouettes.
* **Motion Trails:** Apply a highly localized, subtle horizontal motion blur specifically trailing the moving limbs (the trailing edge of the kicking leg and the swinging bat).
* **Impact Flares:** Pinpoint the exact intersection of action (foot meeting the football, bat meeting the cricket ball). Inject a sharp, localized CSS radial glow or a tiny starburst graphic at these specific coordinates to emphasize the moment of impact.

## Step 19: Live Score Ticker Edge Masking
* **Objective:** Polish the marquee at the top so text doesn't clip harshly at the screen edges.
* **Mask Injection:** Apply a `mask-image` (or `-webkit-mask-image`) to the ticker container track.
* **Mask Logic:** Use a linear gradient that is solid in the center but fades to transparent at the 0% and 100% horizontal edges (`mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent)`).
* **Result:** The scrolling live scores will now smoothly fade out of the shadows on the right and fade back into the shadows on the left.

------ phase 4 ------

# Antigravity Execution Script: Full-Screen Sports Menu Overlay

## Step 20: Full-Screen Overlay Activation & Container
* **Trigger Element:** Target the main taskbar's 3 em dash (`—`) hamburger icon.
* **Interaction:** When hovered upon or clicked, trigger a full-screen overlay to deploy.
* **Transition Logic:** Smoothly drop down a full-screen curtain (`height: 100vh`, `width: 100vw`, `position: fixed`, `z-index: 999`) over the entire webpage.
* **Background Canvas:** Set the background color of this overlay to Absolute Deep Black (`#000000`). It must completely cover the hero page content underneath.

## Step 21: Sports Grid Layout Architecture
* Inside the full-screen overlay, create a centralized grid container (`display: grid`).
* **Alignment:** Center the grid perfectly within the viewport (`place-items: center`).
* **Columns & Spacing:** Use a responsive multi-column layout (e.g., 4 columns on desktop, 2 on mobile) with generous, uniform gaps (`gap: 24px`) between each item so the design remains sleek and uncluttered.

## Step 22: Injecting the Sports Categories
* Populate the grid with exactly 16 individual interactive boxes. 
* Insert the following text labels into the boxes, one per box, using the bold, angular sports font (e.g., Triton) in uppercase:
    1. CRICKET
    2. FOOTBALL
    3. KABADDI
    4. TUG OF WAR
    5. KHO KHO
    6. ATHLETICS
    7. VOLLEYBALL
    8. HANDBALL
    9. BASKETBALL
    10. TABLE TENNIS
    11. LAWN TENNIS
    12. BADMINTON
    13. CHESS
    14. CARROM
    15. POWER SPORTS
    16. ARM WRESTLING
* **Routing:** Program each box to act as a hyperlink routing the user to its respective sport's dedicated webpage.

## Step 23: Base Styling for Sport Cards (Boxes)
* **Dimensions:** Set uniform widths and heights for all 16 boxes so the grid is perfectly symmetrical.
* **Background Fill:** Set the interior background of each box to a "lighter black" or very dark charcoal (`#121212` or `#1A1A1A`). This ensures the boxes are visible against the Absolute Deep Black background.
* **Borders:** Apply a sleek, razor-thin, bright Amber Yellow border (`border: 1px solid #FFBF00`) to every box.
* **Text Styling:** The default state for the text inside the boxes must be Crisp White (`#FFFFFF`), perfectly centered vertically and horizontally within its box.

## Step 24: High-Energy Hover & Click Animations (The Bounce)
* **Target:** Apply a custom CSS transition to all 16 sports boxes (`transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.2s ease`). The `cubic-bezier` curve will create the required bouncy physics.
* **Levitation & Bounce Effect:** When the user's cursor hovers over or clicks a box, it must immediately scale up by **3% to 5%** (`transform: scale(1.04)`). The animation must slightly overshoot and snap back (the bounce effect) giving it a highly tactile, physical feel.
* **Color Shift:** Simultaneously, during the hover/click state, the text inside the box must instantly illuminate from White to the bright Amber Yellow (`#FFBF00`).
* Ensure that the bounding box of the grid does not shift or break when individual boxes expand during this levitation effect.