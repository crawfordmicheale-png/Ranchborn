# Ranchborn — Mobile Game Bible

**Version 0.1**

| | |
|---|---|
| **Working title** | Ranchborn |
| **Genre** | Cozy monster-ranch simulation with generational breeding and optional competitions |
| **Platform** | iOS and Android |
| **Orientation** | Landscape |
| **Presentation** | Fixed-camera, stylized 3D diorama |
| **Play model** | Primarily single-player with optional asynchronous social features |
| **Ideal session length** | 3–10 minutes, with unrestricted longer sessions |
| **Target audience** | Players who enjoy creature collecting, cozy management, breeding systems, decorating, and light competition |

> **Tagline:** Raise them. Shape their lineage. Build a ranch that remembers.

---

## Contents

**Vision**
&nbsp;&nbsp;[1. High Concept](#1-high-concept) ·
[2. The Player Fantasy](#2-the-player-fantasy) ·
[3. Core Design Pillars](#3-core-design-pillars)

**Structure**
&nbsp;&nbsp;[4. Platform and Presentation](#4-platform-and-presentation) ·
[5. Core Gameplay Loops](#5-core-gameplay-loops) ·
[6. Ranch Time](#6-ranch-time) ·
[7. The Ranch Layout](#7-the-ranch-layout) ·
[8. Buildings and Upgrades](#8-buildings-and-upgrades)

**Monsters**
&nbsp;&nbsp;[9. Monster Design](#9-monster-design) ·
[10. Monster Life Stages](#10-monster-life-stages) ·
[11. Monster Needs](#11-monster-needs) ·
[12. Monster Stats](#12-monster-stats) ·
[13. Affinities](#13-affinities) ·
[14. Personality and Behavior](#14-personality-and-behavior) ·
[15. Player Bond](#15-player-bond)

**Breeding**
&nbsp;&nbsp;[16. Breeding System](#16-breeding-system) ·
[17. Genetics](#17-genetics) ·
[18. Player-Created Breeds](#18-player-created-breeds)

**Activities**
&nbsp;&nbsp;[19. Ranch Jobs](#19-ranch-jobs) ·
[20. Automation](#20-automation) ·
[21. Optional Battle Loop](#21-optional-battle-loop) ·
[22. Noncombat Competitions](#22-noncombat-competitions) ·
[23. Expeditions](#23-expeditions)

**Systems**
&nbsp;&nbsp;[24. Progression](#24-progression) ·
[25. Economy](#25-economy) ·
[26. Story](#26-story) ·
[27. Supporting Characters](#27-supporting-characters) ·
[28. Monster Placement and Adoption](#28-monster-placement-and-adoption)

**Craft**
&nbsp;&nbsp;[29. User Interface](#29-user-interface) ·
[30. Art Direction](#30-art-direction) ·
[31. Environmental Art](#31-environmental-art) ·
[32. Audio Direction](#32-audio-direction) ·
[33. Accessibility](#33-accessibility)

**Business and Live Operations**
&nbsp;&nbsp;[34. Monetization Principles](#34-monetization-principles) ·
[35. Daily and Seasonal Content](#35-daily-and-seasonal-content) ·
[36. Social Features](#36-social-features)

**Production**
&nbsp;&nbsp;[37. Technical Design Principles](#37-technical-design-principles) ·
[38. Onboarding](#38-onboarding) ·
[39. Vertical Slice Scope](#39-vertical-slice-scope) ·
[40. Vertical Slice Art Requirements](#40-vertical-slice-art-requirements) ·
[41. Full Launch Scope](#41-full-launch-scope) ·
[42. Development Milestones](#42-development-milestones)

**Guardrails**
&nbsp;&nbsp;[43. Design Success Criteria](#43-design-success-criteria) ·
[44. Features Deliberately Excluded](#44-features-deliberately-excluded) ·
[45. Final Vision](#45-final-vision)

---

## 1. High Concept

Ranchborn is a visual-first mobile monster ranch simulator in which players raise expressive creatures, operate a living ranch, develop distinctive bloodlines, and eventually register breeds of their own creation.

The player inherits a neglected monster ranch with a damaged nursery, overgrown habitats, and a nearly empty breed registry. By caring for monsters, assigning them to visible ranch jobs, pairing compatible adults, and guiding offspring through different environments, the player gradually rebuilds the property and creates lineages unlike those found on any other ranch.

Battling is an optional activity rather than the central progression gate. Players may enter monsters in short arena matches, races, hauling trials, harvest contests, obstacle courses, and breed exhibitions to earn rewards. A monster can be valuable as a worker, companion, show animal, explorer, parent, mentor, racer, or fighter.

The central promise is:

> Players do not merely collect monsters. They create recognizable breeds with appearances, temperaments, specialties, family trees, and histories.

---

## 2. The Player Fantasy

The player begins as the caretaker of a nearly forgotten ranch and grows into a respected breeder whose monsters are recognized across the region.

The player should feel that they are:

- Caring for individual creatures rather than managing anonymous units.
- Watching a small living world rather than navigating a collection of menus.
- Discovering inherited traits through visible offspring.
- Developing a ranch with its own identity and culture.
- Creating lineages that reflect their personal choices.
- Competing when they choose, not because the game demands it.
- Preserving the history of beloved monsters across generations.

By the late game, two players may own the same original species but have dramatically different ranches and bloodlines.

One player may develop calm, flower-antlered Bramblehorns that excel in orchards and support competitions. Another may develop broad-bodied, stone-horned Bramblehorns bred for hauling and defensive arena play.

Both are valid expressions of the same species.

---

## 3. Core Design Pillars

### 3.1 The Ranch Is the Interface

Most gameplay happens directly in the visible ranch.

The player should be able to understand much of the ranch's condition by looking at it:

- Hungry monsters gather near feeding stations.
- Tired monsters seek shelter or nap.
- Social monsters play together.
- Rival monsters avoid or challenge one another.
- An expectant pair gathers nesting material.
- A ready egg wiggles, cracks, and glows.
- Crops visibly mature.
- Workstations show active production.
- A dirty monster has mud on its body.
- A confident competition monster practices near the training yard.

Menus support the world but do not replace it.

> **Design target:** At least 70–80% of ordinary playtime should occur on the ranch screen or in visible activity scenes.

### 3.2 Every Monster Has Value

Combat strength is only one possible form of usefulness.

A monster may specialize in:

- Harvesting
- Hauling
- Mining
- Crafting
- Nursery care
- Exploration
- Racing
- Showing
- Support
- Battle
- Mentorship
- Social harmony

No monster should be rendered worthless by a poor battle stat roll.

A timid monster might be unreliable in an arena but exceptional with hatchlings. A heavy monster may be slow in a race but invaluable at construction. A mischievous monster may occasionally disrupt work while also discovering hidden items.

### 3.3 Generations Matter

Offspring inherit visible and behavioral traits from parents and grandparents.

Players should be able to recognize lineage through:

- Horn and ear shapes
- Body proportions
- Tail types
- Color inheritance
- Coat patterns
- Elemental accents
- Temperament tendencies
- Work instincts
- Signature habits
- Rare mutations

The breeding system should be deep internally but understandable externally.

Casual players can breed based on appearance, personality, and broad predictions. Dedicated breeders can open advanced lineage tools and inspect recessive traits, family history, and inheritance probabilities.

### 3.4 Competition Is Optional

Battles and competitions provide:

- Coins
- Festival ribbons
- Decorations
- Training manuals
- Cosmetic accessories
- Rare feed ingredients
- Invitations
- Prestige
- Breeding requests

However, essential ranch progression must always have a noncombat route.

A player who never enters an arena should still be able to:

- Expand the ranch.
- Discover every base species.
- Develop registered breeds.
- Finish the main story.
- Acquire important buildings.
- Participate in the economy.
- Earn high-tier cosmetic rewards through other competitions.

### 3.5 The Game Respects the Player's Time

Ranchborn should never feel like a list of digital chores.

The game will not include:

- Monsters becoming sick because the player did not log in.
- Permanent death.
- Punishing login streak loss.
- Mandatory energy systems.
- Forced advertisements.
- Real-time breeding timers that require midnight check-ins.
- Essential items locked exclusively behind combat.
- Hundreds of repeated manual feeding actions.
- Gacha-exclusive monsters.

Routine care gradually becomes automated, leaving direct interaction for bonding, observation, breeding, customization, and meaningful decisions.

---

## 4. Platform and Presentation

### 4.1 Mobile Format

Ranchborn is designed specifically for phones and tablets rather than reduced from a desktop simulation.

The game uses:

- Landscape orientation.
- Large touch targets.
- Fixed camera angles.
- Limited panning and zooming.
- No manual camera rotation during normal play.
- Direct interaction with monsters and structures.
- Short activity scenes.
- Compact information panels.
- Automatic saving.

The player does not directly walk an avatar around the ranch.

Instead, the player observes and manages the ranch from an angled caretaker view. A customizable caretaker avatar may appear near the homestead, in photographs, during special interactions, and in short narrative scenes, but navigation remains touch-driven.

### 4.2 Camera

The default camera uses an elevated three-quarter perspective.

The player can:

- Drag to pan within the current ranch zone.
- Pinch to zoom.
- Tap a monster to focus on it.
- Enter a short close-up inspection view.
- Swipe or tap the ranch map to move between zones.

Each ranch zone is a compact diorama rather than part of one enormous seamless map. This improves readability, performance, and art density.

### 4.3 Active Monster Limits

Each zone should normally display approximately six to ten active monsters.

Additional monsters may be:

- Resting in shelters.
- Assigned to another zone.
- Away on an expedition.
- Visiting a competition.
- Staying in the elder meadow.
- Temporarily boarded with an NPC.
- Represented inside a structure.

A smaller number of expressive, readable monsters is preferable to dozens of tiny figures creating visual noise.

---

## 5. Core Gameplay Loops

### 5.1 Moment-to-Moment Loop

1. Observe the ranch.
2. Notice a need, opportunity, or event.
3. Tap a monster, structure, or activity.
4. Perform a direct action or make a simple assignment.
5. Watch the ranch respond.
6. Receive visible feedback.
7. Continue ranching or choose an outing.

Examples include:

- Filling a feeding station.
- Grooming a muddy monster.
- Assigning a strong monster to move lumber.
- Pairing two compatible adults.
- Collecting an orchard harvest.
- Watching a hatchling emerge.
- Entering a sixty-second race.
- Placing a new habitat decoration.
- Registering a developing bloodline.

### 5.2 Typical Session Loop

A five-minute session might include:

1. Opening directly onto the active ranch zone.
2. Collecting visible production.
3. Checking a nursery egg.
4. Feeding or petting a favorite monster.
5. Assigning workers to the orchard and quarry.
6. Advancing a breeding project.
7. Entering one short competition.
8. Purchasing or building an upgrade.
9. Ending the current ranch day.

A longer session may include:

- Reorganizing habitats.
- Studying family trees.
- Planning several future pairings.
- Decorating the ranch.
- Completing story requests.
- Entering a festival.
- Comparing offspring.
- Photographing and sharing a registered breed.

### 5.3 Long-Term Loop

1. Restore the ranch.
2. Discover a new base species.
3. Raise several individuals.
4. Identify useful inherited traits.
5. Develop a planned bloodline.
6. Stabilize the desired traits across generations.
7. Register a player-created breed.
8. Use the breed in work, exhibitions, or competition.
9. Expand into a new habitat.
10. Begin a more advanced breeding project.

---

## 6. Ranch Time

### 6.1 Player-Controlled Days

Core simulation progresses through player-controlled ranch days rather than real-world countdowns.

The player chooses when to end the day.

Ending a day resolves:

- Ranch jobs
- Crop growth
- Egg development
- Relationship growth
- Training progress
- Building construction
- Monster fatigue recovery
- Story events
- Habitat adaptations

The player can spend as much real time as desired decorating, inspecting monsters, or planning before advancing.

### 6.2 Offline Progress

Offline progress is helpful but never harmful.

While the player is away:

- Completed automated stations may accumulate resources.
- Assigned long-form jobs may make limited progress.
- Visitors may arrive.
- Cosmetic environmental events may occur.

While the player is away:

- Monsters do not become critically hungry.
- Eggs do not hatch unseen.
- Relationships do not collapse.
- Buildings do not break down.
- Crops do not rot.
- Competitions are not missed permanently.

Important moments wait for the player.

---

## 7. The Ranch Layout

The ranch is divided into compact visual zones.

### 7.1 Homestead

The central ranch area.

Contains:

- Main barn
- Ranch house
- Feed storage
- Assignment board
- Visitor gate
- Market stall
- Breed registry
- Main pasture
- Basic workshop

The Homestead acts as the primary home screen.

### 7.2 Nursery

Used for:

- Pair bonding
- Nest preparation
- Egg development
- Hatching
- Hatchling care
- Early socialization
- Mentorship
- Juvenile development

Visual assets include:

- Nests
- Soft bedding
- Incubation lamps
- Toys
- Small feeding dishes
- Warm shelters
- Low fencing
- Family resting spaces

The nursery should feel warm, safe, and visually distinct from productive ranch zones.

### 7.3 Orchard

Used for:

- Fruit production
- Herb gathering
- Plant-affinity development
- Pollination
- Agricultural competitions
- Calm temperament growth
- Nursery feed production

Visual assets include:

- Fruit trees
- Trellises
- Irrigation channels
- Flower beds
- Harvest baskets
- Garden sheds
- Compost bins
- Shade structures

### 7.4 Wetlands

Used for:

- Fishing
- Irrigation
- Medicinal plant gathering
- Amphibious species
- Tide-affinity development
- Swimming competitions
- Mud and water-based visual adaptations

Visual assets include:

- Shallow pools
- Reeds
- Lily pads
- Mud banks
- Small docks
- Water wheels
- Rock islands
- Nets and baskets

### 7.5 Quarry

Used for:

- Mining
- Stone gathering
- Crystal discovery
- Heavy hauling
- Defensive training
- Stone-affinity development

Visual assets include:

- Rock walls
- Mine entrances
- Mineral nodes
- Cranes
- Carts
- Crystal clusters
- Reinforced shelters
- Stone training blocks

### 7.6 Ember Yard

Used for:

- Metalworking
- Heat-based crafting
- Ember-affinity development
- Fire-safe training
- Cooking special feed
- Producing advanced building parts

Visual assets include:

- Warm stone
- Blackened soil
- Furnaces
- Glowing cracks
- Bellows
- Forge tables
- Heat-resistant troughs
- Fireproof shelters

### 7.7 Moonwood

A later-game habitat used for:

- Nocturnal species
- Rare mutation projects
- Spirit traits
- Exploration preparation
- Unusual relationship events
- Prestige breeding projects

Visual assets include:

- Pale trees
- Glowing mushrooms
- Moonlit pools
- Soft fog
- Ancient stones
- Hanging lanterns
- Rare flowers
- Quiet nesting areas

### 7.8 Elder Meadow

A permanent home for veteran and retired monsters.

Elders:

- Remain visible.
- Retain their names and histories.
- Mentor younger monsters.
- Appear in family trees.
- Teach learned traits.
- Participate in special events.
- Never disappear because of age.

The Elder Meadow preserves emotional continuity while allowing the ranch to support generational progression.

---

## 8. Buildings and Upgrades

Each major building has three visually distinct upgrade stages.

### Essential Buildings

| Building | Purpose |
|---|---|
| **Main Barn** | Controls overall ranch capacity and storage. |
| **Feeding Station** | Stores and distributes basic feed. |
| **Nursery Lodge** | Unlocks breeding, eggs, and hatchling care. |
| **Workshop** | Produces tools, habitat pieces, and decorations. |
| **Training Yard** | Improves monster skills and prepares them for competitions. |
| **Registry Hall** | Tracks species, family trees, awards, and registered breeds. |
| **Care Lodge** | Supports grooming, comfort, and recovery. |
| **Expedition Gate** | Allows monsters to travel to short exploration activities. |
| **Festival Board** | Provides access to battles, races, exhibitions, and regional events. |
| **Routine Board** | Allows the player to save recurring work assignments and automate ordinary care. |

---

## 9. Monster Design

### 9.1 Monster Philosophy

Ranchborn should launch with a modest number of deeply variable species rather than hundreds of shallow creatures.

Each species needs:

- A recognizable silhouette.
- A clear ecological identity.
- Multiple ranch roles.
- A distinct behavioral style.
- Visual breeding potential.
- A battle or competition identity.
- Several rare trait paths.

The same base species should support many player-created breeds.

### 9.2 Launch Species Target

The full launch target is **eight base species**. The initial vertical slice uses **three**.

| Species | Creature Type | Main Ranch Roles | Competition Identity | Visual Trait Themes |
|---|---|---|---|---|
| **Bramblehorn** | Horned grazer | Harvesting, orchard care, support | Hauling, support battle, breed shows | Horns, moss, flowers, coat patterns |
| **Cinderpup** | Ember canine | Heating, forging, security | Fast battle, sprinting | Ears, mane, ember markings, tails |
| **Puddlekin** | Amphibious gatherer | Fishing, irrigation, wetland gathering | Swimming, evasion battle | Fins, frills, spots, translucent accents |
| **Burrowbit** | Mole-rabbit burrower | Mining, digging, scouting | Obstacle courses, treasure trials | Ears, claws, facial masks, stone plates |
| **Galecrest** | Birdlike glider | Deliveries, scouting, seed spreading | Racing, aerial trials | Crests, wings, tail fans, feather patterns |
| **Loomoth** | Gentle moth creature | Pollination, fiber production, nursery calming | Show competition, support | Wing shapes, antennae, glow patterns |
| **Pebbleback** | Tortoise-like heavy creature | Hauling, construction, quarry work | Defense battle, strength trials | Shell shapes, stone growths, body scale |
| **Glimmerkit** | Small spirit fox | Exploration, visitor entertainment, rare finding | Agility, illusion support, shows | Tails, ear tufts, glow lines, masks |

---

## 10. Monster Life Stages

Each monster progresses through four life stages.

### 10.1 Hatchling

- Small proportions.
- Limited work ability.
- High need for attention.
- Strong environmental sensitivity.
- Early personality development.
- Frequent social interactions.

### 10.2 Juvenile

- Can begin light work.
- Learns habits from adults.
- Develops body traits.
- Gains early competition training.
- Shows clearer temperament.

### 10.3 Adult

- Full work ability.
- Eligible for pairing.
- Full competition access.
- Can mentor hatchlings.
- Displays complete visual phenotype.

### 10.4 Veteran

- Retains identity and history.
- May continue ordinary activity.
- Gains mentorship bonuses.
- Can teach learned traits.
- May move to the Elder Meadow.
- Remains available for special exhibitions.

**There is no permanent death mechanic.**

---

## 11. Monster Needs

Needs are intentionally broad and readable.

### 11.1 Fed

Influenced by:

- Available food.
- Feed quality.
- Species preferences.
- Work intensity.

Low Fed status reduces productivity but never causes permanent damage.

### 11.2 Rested

Influenced by:

- Shelter quality.
- Workload.
- Competition participation.
- Temperament.
- Habitat compatibility.

Tired monsters visibly slow down and seek rest.

### 11.3 Content

Influenced by:

- Social relationships.
- Grooming.
- Habitat comfort.
- Toys and enrichment.
- Preferred jobs.
- Player bond.

Contentment affects behavior, relationship growth, and command reliability.

Exact meters remain hidden during ordinary play. The quick monster card uses simple descriptive states such as:

- Thriving
- Comfortable
- Restless
- Tired
- Hungry
- Overstimulated

Advanced details are available in inspection mode.

---

## 12. Monster Stats

Each monster has five primary stats.

| Stat | Affects |
|---|---|
| **Might** | Hauling · Mining · Construction · Physical damage · Resistance to displacement |
| **Agility** | Racing · Deliveries · Evasion · Action speed · Obstacle performance |
| **Focus** | Crafting · Precision work · Command reliability · Accuracy · Training efficiency |
| **Heart** | Nursery care · Support actions · Social harmony · Recovery · Breed shows · Player bond effects |
| **Instinct** | Gathering · Exploration · Rare item discovery · Environmental reactions · Signature move charge |

Stats have **inherited potential** and **trained current values**.

Breeding affects potential. Ranch activities determine how much of that potential is developed.

---

## 13. Affinities

The initial affinity families are:

- Bloom
- Ember
- Tide
- Stone
- Gale

Affinities influence:

- Habitat preference
- Work bonuses
- Visual effects
- Special abilities
- Competition performance
- Certain mutations

Battle matchups provide only moderate advantages. Affinity should influence strategy without making one creature automatically useless against another.

Rare spirit and moon traits may appear later as advanced lineage modifiers rather than a full sixth combat element.

---

## 14. Personality and Behavior

### 14.1 Core Temperament Axes

Each monster is generated along three internal personality axes:

- Social ↔ Independent
- Calm ↔ Intense
- Cautious ↔ Curious

These produce readable personality tags such as:

- Affectionate
- Reserved
- Patient
- Competitive
- Timid
- Adventurous
- Protective
- Stubborn
- Playful
- Mischievous

### 14.2 Quirks

Each monster may develop one or more personal quirks.

Examples:

- Sleeps beside the orchard gate.
- Hides toys in the barn.
- Refuses blue fruit.
- Follows one particular companion.
- Loves thunderstorms.
- Dislikes crowded pens.
- Greets every visitor.
- Protects hatchlings.
- Stares into reflective water.
- Tries to open gates.
- Carries sticks everywhere.
- Becomes excited near the arena.

Quirks primarily create personality and visual behavior. They should rarely function as major penalties.

### 14.3 Relationships

Monsters form relationships through:

- Shared habitats
- Working together
- Resting together
- Playing
- Competition partnerships
- Mentorship
- Nursery contact
- Conflict events

Relationship states include:

- Unfamiliar
- Comfortable
- Friendly
- Bonded
- Rival
- Protective
- Mentor
- Family

Relationships are shown through behavior rather than constant icons.

Friendly monsters may:

- Rest beside one another.
- Groom one another.
- Follow each other.
- Play together.
- Share feeding space.

Rivals may:

- Compete for attention.
- Stomp or posture.
- Race each other.
- Refuse to share favored objects.

---

## 15. Player Bond

The player develops an individual bond with each monster.

Bond grows through:

- Petting
- Grooming
- Feeding favored treats
- Successful training
- Shared competition
- Responding to personal events
- Photography
- Visiting the monster regularly

Higher bond provides:

- More reliable competition commands.
- Additional close-up animations.
- Unique photo poses.
- Better emotional recovery.
- Personal keepsakes.
- Small work bonuses.

Bond should matter without making constant tapping mandatory.

---

## 16. Breeding System

### 16.1 Pairing Rules

Any two compatible adult monsters of the same species may create an offspring through a fantasy bonding process called **nesting resonance**.

The game does not require gender restrictions.

Pairing requires:

- Both monsters are adults.
- Neither monster is a close relative.
- Nursery space is available.
- Both monsters are sufficiently rested.
- Their relationship is Comfortable or better.

Compatibility affects:

- Pairing speed.
- Trait predictability.
- Temperament outcomes.
- Nesting behavior.

Compatibility does not permanently block reasonable pairings.

### 16.2 Breeding Flow

1. Tap the Nursery Lodge.
2. Select the first parent.
3. View recommended compatible partners.
4. Select the second parent.
5. Review a simple offspring forecast.
6. Confirm the pairing.
7. Watch the pair prepare a nest in the ranch.
8. Advance ranch days.
9. Observe the egg changing visually.
10. Trigger the hatching scene.
11. Name the offspring.
12. Compare visible traits with both parents.
13. Add the offspring to the family tree.

### 16.3 Casual Forecast

The standard breeding screen shows:

- Likely body type.
- Possible colors.
- Possible pattern families.
- Temperament tendencies.
- Expected work strengths.
- Known rare traits.
- Relationship compatibility.

It does not initially show raw gene tables.

### 16.4 Advanced Breeder View

Advanced players can enable a deeper view containing:

- Dominant traits.
- Recessive traits.
- Known carrier states.
- Grandparent inheritance.
- Trait probability ranges.
- Lineage concentration.
- Previous offspring.
- Family relationship warnings.
- Breed-standard progress.

This view is optional.

---

## 17. Genetics

### 17.1 Controlled Trait Slots

Each species uses a controlled set of compatible visual slots.

Typical slots include:

- Body build
- Head shape
- Ear or crest shape
- Horn, frill, or antenna type
- Tail type
- Surface type
- Primary color
- Secondary color
- Pattern
- Elemental accent
- Rare mutation

This system produces variation without creating malformed combinations or animation problems.

### 17.2 Inheritance Model

Internally, major traits use paired inherited values.

Each parent contributes one value to each trait slot.

Trait expression may be:

- Dominant
- Recessive
- Blended
- Co-expressed
- Environmentally activated

A visually ordinary monster may carry a rare recessive trait and pass it to later offspring.

Grandparent traits can reappear unexpectedly, making family trees meaningful.

### 17.3 Mutation

Mutations are rare visual or functional variations.

Examples:

- Flowering antlers
- Crystal shell ridges
- Twin tails
- Unusual eye glow
- Translucent fins
- Ember footprints
- Moonlit markings
- Feathered ears
- Moss-covered armor plates

Mutation chance is influenced by:

- Base rarity.
- Habitat.
- Special feed.
- Parental lineage.
- Story discoveries.
- Seasonal events.

**Premium purchases never increase mutation odds.**

### 17.4 Upbringing Effects

Not every trait is inherited.

A monster's upbringing can create acquired traits such as:

- Orchard-trained
- Quarry hardened
- Nursery gentle
- Arena confident
- Wetland adapted
- Night explorer
- Skilled caretaker
- Festival trained

Some acquired traits also create subtle visual changes:

- Moss growth
- Polished horns
- Work wraps
- Mineral dust
- Decorative ribbons
- Elemental glow
- Seasonal flowers

These changes communicate history without rewriting the monster's inherited anatomy.

### 17.5 Preventing Endless Power Creep

Breeding should create specialization rather than unavoidable superiority.

Examples:

- Heavy bodies improve Might but reduce Agility.
- Highly intense temperaments improve aggressive performance but reduce social work.
- Large horns may improve defense but require more food.
- Calm support breeds may excel in group work but lack burst damage.
- Rare visual mutations are not automatically stronger.

The ideal monster depends on the player's goal.

---

## 18. Player-Created Breeds

### 18.1 Breed Registration

A player may register a custom breed after developing a stable lineage.

Suggested requirements:

- At least three generations.
- At least six qualifying monsters.
- At least two founder branches.
- Four consistent visual traits.
- Two consistent behavioral, work, or competition tendencies.
- No close-relative pairing in the qualifying lineage.
- A completed breed evaluation.

### 18.2 Breed Standard

When registering a breed, the player chooses:

- Breed name
- Crest
- Founding monsters
- Four hallmark visual traits
- One temperament standard
- One primary specialty
- One secondary specialty
- Short description

**Example — Sunorchard Bramblehorn**

| Field | Value |
|---|---|
| Hallmark traits | Blossom antlers · Pale moss coat · Gold facial stripe · Compact body |
| Temperament | Calm and social |
| Primary specialty | Orchard work |
| Secondary specialty | Support competition |

### 18.3 Benefits of Registration

Registration provides:

- A custom breed card.
- A crest displayed on qualifying monsters.
- Prestige and ranch reputation.
- NPC breeding requests.
- Breed exhibition access.
- Increased prediction accuracy within the stabilized lineage.
- Special photo frames.
- Historical records.
- Cosmetic banners and ranch signs.

Registration should not provide a large raw-stat bonus.

Its primary rewards are identity, predictability, prestige, and additional activities.

### 18.4 Breed Ranks

Registered breeds can progress through three recognition levels:

| Rank | Meaning |
|---|---|
| **Emerging** | The breed has been newly registered. |
| **Recognized** | The breed has produced additional qualifying generations and completed regional evaluations. |
| **Heritage** | The breed has a long documented lineage, several award-winning members, and stable characteristics. |

Heritage status is a major long-term achievement.

---

## 19. Ranch Jobs

Monsters are assigned directly to visible work areas.

Typical jobs include:

- Harvest
- Irrigate
- Gather
- Mine
- Haul
- Craft
- Build
- Care
- Scout
- Deliver
- Entertain
- Guard

The player can assign work by:

- Dragging a monster toward an activity marker.
- Tapping the job and selecting from recommended monsters.
- Saving a recurring assignment on the Routine Board.

Work suitability is based on:

- Stats
- Species instincts
- Personality
- Learned traits
- Habitat comfort
- Relationships with coworkers
- Current energy

### 19.1 Visible Work

Jobs should be represented through visible animation loops.

Examples:

- A Bramblehorn nudges fruit baskets toward storage.
- A Puddlekin opens irrigation channels.
- A Cinderpup warms a forge.
- A Burrowbit digs around a mineral deposit.
- A Pebbleback pulls a lumber cart.
- A Loomoth pollinates orchard flowers.
- A Galecrest carries small packages between zones.
- A Glimmerkit entertains visitors with light illusions.

The player does not need to watch the entire task, but seeing it happen reinforces that the ranch is alive.

---

## 20. Automation

Manual care is most frequent during the early game and gradually becomes optional.

Automation unlocks include:

- Larger feeding stations.
- Automatic water troughs.
- Saved job routines.
- Zone foremen.
- Assigned nursery caretakers.
- Scheduled crop collection.
- Workshop production queues.
- Habitat cleaning stations.

A trained monster may become a zone foreman and automatically coordinate routine jobs.

Automation should create visible prosperity rather than removing monsters from the simulation.

---

## 21. Optional Battle Loop

### 21.1 Battle Format

Battles are:

- One monster versus one monster.
- Approximately 45–75 seconds.
- Mostly automatic.
- Easy to read on a phone.
- Influenced by breeding, training, temperament, and bond.

The monster moves and performs basic actions independently.

The player provides a limited number of tactical commands.

### 21.2 Player Commands

The initial command set is:

| Command | Effect |
|---|---|
| **Press** | Encourages aggressive action and faster signature charging. |
| **Guard** | Prioritizes defense, spacing, and counterattacks. |
| **Focus** | Improves accuracy, technique selection, and command reliability. |
| **Rally** | Restores resolve and helps a tired or frightened monster recover. |

Commands use a small rechargeable command meter. The player is not expected to tap continuously.

### 21.3 Monster Moves

Each monster equips:

- One basic physical action.
- One affinity action.
- One learned technique.
- One signature move.

Temperament influences how the monster uses them.

Examples:

- An intense Cinderpup may attack early.
- A cautious Puddlekin may maintain distance.
- A calm Bramblehorn may wait for a support opportunity.
- A stubborn Pebbleback may ignore a retreat instinct.

Player bond improves command response but does not remove personality.

### 21.4 Battle Loss

Losing causes:

- Temporary fatigue.
- Reduced confidence until rested or comforted.
- No permanent injury.
- No lost monster.
- No destroyed equipment.
- No lost lineage progress.

The player still receives a small participation reward.

### 21.5 Battle Rewards

Possible rewards include:

- Coins
- Festival ribbons
- Training manuals
- Decorative trophies
- Cosmetic accessories
- Rare crafting ingredients
- Special opponent invitations
- Ranch reputation

Equivalent essential rewards can be obtained through noncombat activities.

---

## 22. Noncombat Competitions

### 22.1 Racing

Tests:

- Agility
- Focus
- Temperament
- Endurance
- Course affinity

The player chooses a race strategy and provides limited encouragement commands.

### 22.2 Hauling Trials

Tests:

- Might
- Endurance
- Stability
- Teamwork

Ideal for heavy working breeds.

### 22.3 Obstacle Courses

Tests:

- Agility
- Focus
- Curiosity
- Training
- Environmental traits

### 22.4 Harvest Contests

Tests:

- Work aptitude
- Instinct
- Focus
- Habitat specialization
- Cooperation

### 22.5 Breed Shows

Judged on:

- Breed-standard consistency
- Grooming
- Bond
- Temperament
- Visual presentation
- Lineage history
- Registered breed prestige

Breed shows are a major noncombat endgame activity.

---

## 23. Expeditions

Expeditions provide short visual adventures beyond the ranch.

The player chooses:

- A destination.
- One or two monsters.
- Basic supplies.
- A general approach.

The expedition then plays as a short diorama sequence with one or two decisions.

Possible outcomes include:

- Discovering a new species.
- Finding rare feed.
- Unlocking a habitat.
- Recovering registry pages.
- Meeting an NPC breeder.
- Finding a cosmetic item.
- Revealing a hidden mutation condition.

Expeditions should not become long text-menu adventures.

---

## 24. Progression

### 24.1 Ranch Reputation

Reputation increases through:

- Restoring buildings.
- Completing requests.
- Registering breeds.
- Entering exhibitions.
- Helping visitors.
- Discovering species.
- Completing story chapters.
- Winning competitions.

Reputation unlocks:

- Ranch zones
- Building upgrades
- New species
- Festival tiers
- Visitors
- Decoration sets
- Registry functions
- Advanced breeding tools

### 24.2 Player Progression

The player does not have traditional combat levels.

Progress is represented through:

- Ranch reputation
- Registry completion
- Building restoration
- Breeder rank
- Registered breeds
- Festival invitations
- Story completion
- Collection of awards and decorations

### 24.3 Monster Progression

Individual monsters improve through:

- Work experience
- Training
- Competition
- Mentorship
- Bond
- Habitat adaptation
- Learned techniques
- Veteran status

Monsters do not simply level up by fighting.

---

## 25. Economy

### 25.1 Ranch Coins

The primary soft currency.

**Earned through:** Selling produce · Completing requests · Visitor fees · Crafting orders · Competitions · Expeditions · Ranch contracts

**Used for:** Feed · Construction · Building upgrades · Basic decorations · Training · Services

### 25.2 Festival Ribbons

A prestige currency earned from all major competition categories.

**Earned through:** Battles · Races · Harvest contests · Shows · Hauling trials · Obstacle events

**Used for:** Festival decorations · Trophy displays · Cosmetic equipment · Special training items · Registry presentation items

Combat is not the only source.

### 25.3 Materials

Physical ranch materials include:

- Timber
- Stone
- Fiber
- Produce
- Fish
- Herbs
- Crystal
- Metal

These are obtained through visible ranch work and expeditions.

### 25.4 Premium Currency

A premium cosmetic currency may be included in the commercial version.

**It can purchase:**

- Ranch themes
- Decorative sets
- Caretaker outfits
- Monster accessories
- Photo frames
- Breed crest designs
- Cosmetic building skins

**It cannot purchase:**

- Exclusive statistical traits
- Increased mutation odds
- Guaranteed powerful offspring
- Arena victories
- Essential species
- Breeding compatibility
- Permanent stat advantages

---

## 26. Story

### 26.1 Premise

The player inherits an abandoned property once known as one of the region's finest monster ranches.

Years earlier, a destructive storm damaged the ranch, scattered its animals, and destroyed much of its breed registry. The previous owner closed the property rather than rebuild it.

The player arrives with:

- One damaged barn.
- One overgrown pasture.
- A partially legible breeding journal.
- One rescued monster.
- A promise to reopen before the next Grand Exhibition.

As the ranch grows, the player discovers that several supposedly extinct bloodlines may have originated there.

### 26.2 Story Structure

| Chapter | Title | Focus |
|---|---|---|
| One | The Empty Pasture | Restore the barn, feed the first monster, and reopen the ranch gate. |
| Two | The First Nest | Repair the nursery and raise the first offspring. |
| Three | The Lost Registry | Recover damaged family records and unlock advanced lineage tracking. |
| Four | Old Bloodlines | Search regional habitats for traits linked to the former ranch. |
| Five | The Regional Festivals | Choose combat and noncombat routes to rebuild the ranch's reputation. |
| Six | The Grand Exhibition | Present a player-created breed and restore the ranch's standing. |

The game continues indefinitely after the story.

---

## 27. Supporting Characters

**Miri Vale** — A retired caretaker who helps the player restore basic ranch functions.
*Role:* Tutorial guide · Emotional connection to the former ranch · Source of old stories · Nursery specialist

**Tamsin Reed** — A young naturalist studying monster adaptation.
*Role:* Genetics explanation · Habitat research · Species discovery · Mutation quests

**Bram Kestrel** — The regional festival steward.
*Role:* Competitions · Festival invitations · Breed evaluations · Rival introductions

**Rhea Flint** — A talented, competitive rancher.
*Role:* Friendly rival · Battle and race challenges · Different philosophy of breeding · Long-term respect arc

**Niko Pell** — A traveling merchant and adoption coordinator.
*Role:* Market access · Visitor contracts · Monster placement · Letters from adopted monsters

Dialogue should remain brief and visually staged. The game should avoid long walls of text.

---

## 28. Monster Placement and Adoption

Players should not be encouraged to sell unwanted monsters as disposable inventory.

Alternative placement options include:

- Family farms
- Sanctuaries
- Research preserves
- Other NPC ranches
- Delivery guilds
- Festival schools
- Orchard collectives

Placed monsters may later send:

- Letters
- Photographs
- Gifts
- Competition invitations
- Offspring updates
- Surprise visits

This gives roster management emotional continuity.

---

## 29. User Interface

### 29.1 Main Ranch Screen

The main ranch screen contains only essential persistent elements.

| Position | Contents |
|---|---|
| Top left | Ranch level · Coins · Current zone |
| Top right | Ranch day · Weather · Compact notification center |
| Bottom left | Build and decorate |
| Bottom center | Current objective or active event |
| Bottom right | Ranch Book · Festival Board · Market |

The center of the screen remains open for the ranch.

### 29.2 Monster Quick Card

Tapping a monster opens a compact card containing:

- Name
- Life stage
- Current mood
- Current task
- Bond level
- One notable trait
- Quick-action icons

Quick actions include:

- Pet
- Feed
- Groom
- Move
- Assign
- Train
- Inspect

Common interactions should require no more than one or two taps.

### 29.3 Monster Inspection

The detailed inspection screen contains only three primary sections.

**Overview** — Appearance · Mood · Stats · Work aptitudes · Bond · Current traits

**Traits** — Inherited traits · Learned traits · Personality · Affinity · Known recessive traits · Competition techniques

**Lineage** — Parents · Grandparents · Offspring · Breed progress · Awards · Family history

No ordinary monster should require navigation through ten separate tabs.

### 29.4 World-Based Notifications

Examples:

- A hatch-ready egg wiggles.
- A completed workshop shows stacked goods.
- A hungry monster waits near an empty trough.
- A visitor stands at the gate.
- A battle-ready monster practices near the arena sign.
- A newly compatible pair rests together near the nursery.
- An available harvest sparkles lightly.
- A building under construction visibly changes each day.

The ranch should communicate before the notification menu does.

---

## 30. Art Direction

### 30.1 Overall Style

The game uses a cozy, stylized 3D look with a handcrafted diorama quality.

Visual characteristics:

- Rounded forms
- Strong silhouettes
- Large readable faces
- Soft edges
- Controlled color palettes
- Slightly exaggerated proportions
- Toy-like structures
- Painted wood and clay materials
- Gentle environmental animation
- Clear visual states

The game should not use:

- Realistic fur simulation
- Photorealistic environments
- Highly detailed micro-textures
- Complex cloth physics
- Large open worlds
- Heavy dynamic lighting
- Excessive particle clutter

### 30.2 Monster Readability

At ordinary phone scale, the player must be able to distinguish:

- Species
- Life stage
- Body build
- Major horns or ears
- Tail type
- Primary pattern
- Mood
- Current activity

Each monster should use:

- Two or three dominant color blocks.
- One strong silhouette feature.
- Large expressive eyes or face elements.
- Controlled accessory placement.
- Clear body language.

### 30.3 Visual Genetics Pipeline

Each species should be built from:

- One core adult rig.
- One hatchling form.
- One juvenile form.
- Several controlled body-shape variants.
- Interchangeable species-specific parts.
- Pattern masks.
- Palette masks.
- Rare mutation attachments.
- Shared animation logic.
- A small set of unique animations.

Suggested launch target per species:

| Asset | Count |
|---|---|
| Body builds | 3 |
| Head or facial variants | 4 |
| Primary feature variants | 4 |
| Tail variants | 3 |
| Pattern masks | 6 |
| Curated palettes | 8 |
| Rare mutation attachments | 3 |
| Shared animation states | 16 |
| Species-specific behaviors | 4 |

### 30.4 Core Animation Set

Each species requires:

- Idle
- Walk
- Run
- Eat
- Drink
- Sleep
- Wake
- Happy reaction
- Upset reaction
- Curious reaction
- Social greeting
- Play
- Work
- Carry or interact
- Battle stance
- Basic attack
- Affinity action
- Hit reaction
- Victory
- Exhausted

Not every animation requires completely unique motion. Shared state logic can combine with species-specific timing and poses.

### 30.5 Behavioral Animation Examples

**Bramblehorn** — Rubs horns against trees · Nudges seedlings · Chews flowers · Stamps when stubborn

**Cinderpup** — Chases ember sparks · Warms its bed · Shakes off smoke · Pounces during play

**Puddlekin** — Splashes in troughs · Inflates cheek frills · Slides through mud · Sleeps partially submerged

**Burrowbit** — Pops out of small holes · Cleans its claws · Hides objects · Sniffs mineral deposits

---

## 31. Environmental Art

### 31.1 Terrain

Required terrain types include:

- Grass
- Dirt
- Mud
- Garden soil
- Stone
- Sand
- Shallow water
- Path surfaces
- Volcanic earth
- Moonwood ground

### 31.2 Structures

Core structure assets include:

- Barn
- Ranch house
- Nursery
- Workshop
- Care lodge
- Training yard
- Registry hall
- Market stall
- Feed storage
- Troughs
- Shelters
- Fences
- Gates
- Bridges
- Festival platform

### 31.3 Interactive Props

Examples:

- Feed buckets
- Brushes
- Toys
- Nests
- Eggs
- Crates
- Tools
- Harvest baskets
- Mineral carts
- Fishing nets
- Lanterns
- Banners
- Training posts
- Race markers
- Show podiums

Props should often have visible states:

- Full or empty
- New or worn
- Clean or dirty
- Active or inactive
- Complete or under construction

---

## 32. Audio Direction

### 32.1 Music

Music should be:

- Warm
- Gentle
- Melodic
- Lightly rustic
- Magical without becoming grandiose

Each ranch zone can add a subtle instrumental layer.

Competition music should become livelier without feeling aggressive.

### 32.2 Monster Audio

Each species requires:

- Greeting vocalization
- Happy sound
- Concerned sound
- Sleep sound
- Work sound
- Battle effort
- Victory sound

Individual pitch and timing variation can help monsters feel distinct without requiring unique recordings for every creature.

### 32.3 Environmental Audio

Examples:

- Wind through grass
- Barn creaks
- Water trickling
- Distant animal calls
- Forge crackle
- Orchard insects
- Soft rain
- Festival crowd ambience

Audio should reinforce the living ranch without overwhelming mobile speakers.

---

## 33. Accessibility

Ranchborn should include:

- Adjustable text size
- Colorblind-safe pattern communication
- Icons that do not rely only on color
- Reduced-motion mode
- Reduced particle effects
- Optional haptic feedback
- Subtitles for all voiced content
- Adjustable music and effect levels
- High-contrast interaction outlines
- Simplified drag controls
- Tap alternatives for drag actions
- Left- and right-side UI layout options
- Confirmation for important monster placement or release decisions

---

## 34. Monetization Principles

The recommended commercial model is **free-to-start with cosmetic-first monetization**.

**Acceptable purchases include:**

- Ranch decoration packs
- Seasonal visual themes
- Caretaker clothing
- Monster accessories
- Breed crest designs
- Photo-mode frames
- Cosmetic building appearances
- Supporter packs

**The game must not sell:**

- Randomized monster eggs
- Powerful exclusive genes
- Increased mutation odds
- Paid arena advantages
- Mandatory breeding speed boosts
- Essential habitats
- Story access through repeated microtransactions

Advertisements, if included, are:

- Optional
- Rewarded
- Never shown without player initiation
- Not required for standard progression

A one-time supporter purchase may remove all advertising prompts.

---

## 35. Daily and Seasonal Content

### 35.1 Daily Ranch Request

One small optional request appears each real-world day.

Examples:

- Harvest five orchard fruits.
- Groom two monsters.
- Complete one job with a bonded pair.
- Enter any competition.
- Photograph a hatchling.

Missing a request does not break a streak.

### 35.2 Weekly Festival

A rotating event offers several activity categories.

A player can participate through:

- Battle
- Racing
- Hauling
- Harvesting
- Obstacle courses
- Breed shows

The weekly reward track should accept points from any category.

### 35.3 Seasons

Seasonal changes may include:

- New ranch decorations
- Weather
- Visitor clothing
- Limited story events
- Cosmetic accessories
- Special photography scenes
- Temporary festival themes

Seasonal content should not permanently lock important monster species or genetic traits.

---

## 36. Social Features

Initial social features are asynchronous.

They include:

- Sharing monster portraits
- Sharing breed cards
- Sharing family trees
- Visiting a friend's showcase ranch
- Leaving guestbook reactions
- Comparing festival scores
- Sending basic material gifts
- Viewing featured community breeds

Direct monster trading is not included at launch.

A later system may allow controlled breeding contributions through a **Stud Book**, where another player's registered monster contributes genetic potential without transferring ownership.

Player-created breed names, descriptions, and guestbook text require moderation tools.

---

## 37. Technical Design Principles

### 37.1 Data-Driven Content

Species, traits, jobs, buildings, and competitions should be defined through editable data rather than hardcoded behavior.

This allows the team to add:

- New species
- New trait variations
- New work activities
- New competitions
- New mutation conditions
- New decorations

without rebuilding the entire game.

### 37.2 Monster Record

Each monster record should contain:

- Unique ID
- Name
- Species ID
- Life stage
- Birth date in ranch days
- Parent IDs
- Grandparent references
- Genotype
- Expressed visual traits
- Acquired traits
- Stat potential
- Current trained stats
- Personality axes
- Personality tags
- Quirks
- Player bond
- Monster relationships
- Current needs
- Current job
- Awards
- Competition techniques
- Registered breed ID
- Cosmetic equipment
- Mutation history
- Deterministic appearance seed

### 37.3 Behavior System

Monster behavior should use a priority-based state system.

Possible states include:

- Idle
- Wander
- Eat
- Drink
- Rest
- Socialize
- Play
- Work
- Seek comfort
- Avoid rival
- Follow friend
- Visit favored object
- React to player
- Practice
- Prepare nest

Personality modifies how frequently and strongly each behavior is selected.

### 37.4 Performance Targets

The game should target:

- Stable 30 frames per second on supported lower-end devices.
- Optional 60 frames per second on capable devices.
- Six to ten active monsters per normal ranch zone.
- Simplified shadows and lighting.
- Object pooling for effects.
- Animation culling outside the active camera.
- Level-of-detail support.
- Compact save data.
- Fast zone transitions.
- Resume from suspension directly into the ranch.

---

## 38. Onboarding

### First Five Minutes

1. Arrives at the abandoned ranch.
2. Meets Miri.
3. Clears a small feeding area.
4. Rescues the first Bramblehorn.
5. Feeds and names it.
6. Assigns it to clear overgrowth.
7. Watches the pasture visibly improve.

### First Fifteen Minutes

1. Repairs the barn.
2. Unlocks the orchard.
3. Meets a second monster.
4. Learns basic work assignment.
5. Completes a small visitor request.
6. Receives the damaged nursery plan.

### First Thirty Minutes

1. Repairs the nursery.
2. Creates the first compatible pairing.
3. Observes nest preparation.
4. Advances ranch days.
5. Hatches the first offspring.
6. Sees clear visual inheritance.
7. Enters either a race or introductory battle.
8. Chooses the next ranch upgrade.

The first visually meaningful offspring must appear early enough to prove the game's central hook.

---

## 39. Vertical Slice Scope

The first playable vertical slice should include:

**Monsters** — Bramblehorn · Cinderpup · Puddlekin

**Life Stages** — Hatchling · Juvenile · Adult

**Ranch Zones** — Homestead · Nursery · Orchard · Wetlands

**Core Systems**

- Feeding
- Rest
- Contentment
- Player bond
- Personality
- Work assignment
- Relationships
- Breeding
- Visual inheritance
- Hatchlings
- Simple family tree
- One registered breed test
- Building upgrades
- Ranch day progression

**Activities** — One battle arena · One race · One harvest contest · One short expedition

**Content**

- Approximately twenty guided requests
- One story chapter
- One ranch restoration arc
- One full two- or three-generation breeding objective

---

## 40. Vertical Slice Art Requirements

### Monster Assets

For each of the three species:

- One adult model
- One juvenile model or proportion variant
- One hatchling model
- Three body builds
- Three or four primary feature variants
- Three tail or rear-feature variants
- Six pattern masks
- Six to eight palettes
- One rare mutation
- Core animation set
- Three unique behavior animations

### Environment Assets

- Four complete ranch zones
- Basic day lighting
- Barn
- Nursery
- Orchard station
- Wetland station
- Training yard
- Arena
- Race course
- Twenty to thirty decorative props
- Visible construction stages
- Basic weather effects

### Interface Assets

- Main HUD
- Monster quick card
- Monster inspection
- Breeding forecast
- Family tree
- Build mode
- Festival selection
- Result screens
- Breed registration card

---

## 41. Full Launch Scope

A realistic initial launch target is:

- Eight base species
- Six primary ranch habitats
- Four life stages
- Five competition categories
- Three battle arenas
- One complete main story
- Advanced breed registration
- Ranch photography
- Asynchronous ranch visiting
- Seasonal festival framework
- More than one hundred decorations
- Several hundred curated visual trait combinations
- Multiple generation-long breeding projects
- Ongoing post-launch species and habitat support

---

## 42. Development Milestones

### Milestone 001: Visual Ranch Slice

- Establish camera.
- Establish touch controls.
- Display one living monster.
- Complete one feeding interaction.
- Complete one visible work interaction.
- Validate mobile performance.

### Milestone 002: Monster Life

- Add needs.
- Add personality.
- Add idle behavior.
- Add relationships.
- Add bond interactions.
- Support multiple active monsters.

### Milestone 003: Ranch Work

- Add jobs.
- Add resources.
- Add building upgrades.
- Add day progression.
- Add visible production.
- Add basic automation.

### Milestone 004: Breeding

- Add pairing.
- Add inheritance.
- Add egg development.
- Add hatching.
- Add offspring growth.
- Add family trees.
- Demonstrate visible grandparent inheritance.

### Milestone 005: Competition

- Add one battle.
- Add one noncombat event.
- Add rewards.
- Add fatigue.
- Confirm competitions support rather than replace ranching.

### Milestone 006: Breed Registry

- Track stable traits.
- Register a custom breed.
- Create a breed card.
- Unlock breed exhibitions.
- Validate the long-term progression hook.

### Milestone 007: Content and Story

- Add tutorials.
- Add characters.
- Add quests.
- Add zone restoration.
- Add species discovery.
- Prepare a soft-launch content path.

---

## 43. Design Success Criteria

The game is succeeding when:

- Players spend most of their time watching and interacting with the ranch.
- Common actions require no more than two taps.
- Monsters are recognizable at normal phone scale.
- Offspring visibly resemble their parents.
- Players remember individual monster names and quirks.
- Noncombat monsters remain useful.
- Players can make meaningful progress without entering battle.
- Breeding feels understandable without requiring advanced menus.
- Advanced breeders still find meaningful depth.
- Routine care becomes easier as the ranch develops.
- Registered breeds feel personally owned.
- The player is excited to hatch the next generation.

---

## 44. Features Deliberately Excluded

Ranchborn is not intended to become:

- A large open-world exploration game.
- A direct-control action RPG.
- A complex tactical combat game.
- A menu-heavy genetic spreadsheet.
- A creature gacha.
- A punishing survival simulator.
- A real-time farming obligation.
- A competitive pay-to-win battler.
- A game where weak monsters are discarded.
- A ranch containing hundreds of tiny active creatures at once.

These exclusions protect the central experience.

---

## 45. Final Vision

Ranchborn should feel like opening a small enchanted ranch and finding that every creature has continued living while the player was away — not deteriorating, not demanding punishment-driven attention, but carrying on with visible habits, relationships, and work.

The game's identity comes from the combination of:

- A living visual ranch.
- Expressive individual monsters.
- Controlled but deep inheritance.
- Player-created breeds.
- Generational continuity.
- Optional short competitions.
- Respectful mobile pacing.

The strongest long-term player stories will not be:

> "I collected the rarest monster."

They will be:

> "This is Mossbell. Her horns came from her grandfather, she learned orchard work from our first ranch monster, and every Sunorchard Bramblehorn on my ranch descends from her."

That is the emotional and mechanical heart of Ranchborn.
