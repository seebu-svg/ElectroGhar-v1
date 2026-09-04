-- ============================================================
-- ElectroGhar — Blog System Setup (schema + seed)
-- Run this ONCE in the Supabase Dashboard SQL Editor.
-- Safe to re-run: every statement is idempotent.
-- ============================================================

-- ── Blog Categories ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ── Blogs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blogs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  excerpt          TEXT,
  content          TEXT,               -- plain text; blank-line paragraphs,
                                     -- "## " h2, "### " h3, "- " list items
  cover_image      TEXT,
  category         TEXT REFERENCES blog_categories(slug) ON DELETE SET NULL,
  author           TEXT DEFAULT 'ElectroGhar Team',
  author_role      TEXT,
  tags             JSONB DEFAULT '[]'::jsonb,

  is_featured      BOOLEAN DEFAULT false,
  is_published     BOOLEAN DEFAULT false,
  published_at     TIMESTAMPTZ,
  views            INT DEFAULT 0,

  -- SEO
  meta_title       TEXT,
  meta_description TEXT,

  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_blogs_category   ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published  ON blogs(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_blogs_featured   ON blogs(is_featured)  WHERE is_featured  = true;
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC);

-- ── Auto-update updated_at (reuses the existing trigger fn) ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row-Level Security ──────────────────────────────────────
ALTER TABLE blogs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published blogs"
  ON blogs FOR SELECT
  USING (is_published = true);

CREATE POLICY "Public read blog categories"
  ON blog_categories FOR SELECT
  USING (true);

-- ============================================================
-- SEED — blog categories
-- ============================================================
INSERT INTO blog_categories (name, slug, description, sort_order) VALUES
  ('Buying Guides',        'buying-guides',        'Smart ways to spend your money on tech in Pakistan.', 1),
  ('Tech Tips',            'tech-tips',            'Practical tips to get more out of your machines.',    2),
  ('Troubleshooting',      'troubleshooting',      'Fix common laptop problems yourself, step by step.',  3),
  ('Reviews & Comparisons','reviews-comparisons',  'Head-to-head comparisons from real shop-floor experience.', 4)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED — 8 blog posts (all published, 2 featured)
-- ============================================================

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'How to Buy a Used Laptop in Pakistan — The Complete Checklist',
  'how-to-buy-a-used-laptop-in-pakistan',
  $txt$Battery health, dead pixels, hinge strength, keyboard wear — the exact checks we run on every laptop before it earns a listing on ElectroGhar. Print this checklist before you shop anywhere.$txt$,
  $txt$A used laptop can be the best value in tech — or an expensive mistake. The difference is almost never luck. It is a checklist, done in the right order, in about fifteen minutes.

This is the same inspection process we run at ElectroGhar before any machine gets listed. Use it whether you buy from us, from Hall Road, or from a stranger on OLX.

## 1. Start With the Hinge and Body

Open and close the lid slowly, twice. A healthy hinge moves smoothly and holds any angle. A loose hinge means the machine was carried open, dropped, or worn hard — and hinge repair on modern laptops often means replacing the whole top assembly.

Run your fingers along the edges. Cracks near the corners and screw holes tell you the machine has been opened before, or worse, dropped.

## 2. Check the Screen Like You Mean It

Set the desktop background to pure black and look at the whole panel in a dark room. Dead pixels show as tiny bright dots. Backlight bleed glows around the edges. Now switch to pure white and look for dark patches and pressure marks.

Also check brightness at 100%. A dim panel at full brightness usually means a worn backlight or a cheap replacement panel.

## 3. Test Every Single Key

Open Notepad and press every key, in rows. You are looking for keys that register twice, do not register, or feel mushy. Keyboard replacement is cheap on business laptops and expensive on thin ultrabooks — know which one you are holding.

## 4. Battery Health Is Non-Negotiable

On Windows, run powercfg /batteryreport from the command prompt. It gives you design capacity versus full charge capacity. Below 70% of design capacity, negotiate the price down or walk away. Below 50%, assume you will replace the battery soon.

Any seller who refuses a battery report is telling you something.

## 5. Stress the CPU for Ten Minutes

Plug in a USB drive with a stress test, or simply play a YouTube video at 1080p for ten minutes while feeling the exhaust vent. If the fan screams and the chassis becomes painful to touch within minutes, the cooling system is clogged or the thermal paste is dead.

## 6. Check the Storage

Run a quick SMART read with a free tool like CrystalDiskInfo. You want "Good" health, and on SSDs, a reasonable amount of remaining life. A failing drive does not always announce itself — SMART data does.

## 7. Verify the Ports and Webcam

HDMI, every USB port, the audio jack, the card reader, Wi-Fi, and the webcam. Test each one. Dead ports are cheap to discover now and annoying to live with later.

## Red Flags That End the Inspection

- Seller will not let you test on battery power
- Windows is not activated or the license is "being sorted"
- Machine was "used very lightly" but the keyboard is shiny and worn
- No charger, or a charger from a different brand
- Price that is dramatically below market with an urgent story

## The Honest Bottom Line

A good used laptop beats a bad new one every time. Business lines like the Dell Latitude, HP EliteBook, and Lenovo ThinkPad were built to survive three office workers and still have years left in them. Bring this checklist, take your time, and never let a seller rush the inspection — patience is the one upgrade that costs nothing.$txt$,
  'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200&q=80',
  'buying-guides',
  'Bilal Ahmed',
  'Founder & Lead Technician',
  '["used laptops","checklist","buying guide","pakistan"]',
  true,
  true,
  '2026-08-28T10:00:00+05:00',
  842,
  'Used Laptop Buying Checklist — Pakistan Edition | ElectroGhar',
  $txt$The 15-minute inspection checklist we run on every used laptop: hinge, screen, keyboard, battery health, thermals, storage, and the red flags that end the deal.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Refurbished vs Used vs New: Which Laptop Should You Buy?',
  'refurbished-vs-used-vs-new-laptops',
  $txt$Refurbished machines are tested and restored. Used machines are sold as-is. New machines cost the most. Here is how to choose based on your budget, your risk tolerance, and how long you plan to keep the machine.$txt$,
  $txt$Every week someone asks us the same question: "Should I buy new, used, or refurbished?" The honest answer is that all three can be the right choice — for different people. Here is how to decide in under five minutes.

## What You Actually Get With Each Option

A new laptop gives you a sealed unit, a full warranty, the latest generation of silicon, and the highest price. A used laptop gives you the lowest price and the machine exactly as the previous owner left it. A refurbished laptop sits in between: a used machine that has been inspected, repaired where needed, cleaned, and retested before resale.

## Where Each Option Wins

Buy new when you need specific modern features: current-generation performance, a high-refresh display, Thunderbolt, or a manufacturer warranty you can lean on for three years. If your work depends on the machine and downtime costs you money, the warranty alone can justify the premium.

Buy used when the machine is a known-reliable business line and you can inspect it properly. This is where the best price-to-performance lives in Pakistan. A three-year-old Latitude or ThinkPad at a third of its original price, checked properly, will outlast a brand-new budget consumer laptop.

Buy refurbished when you want used-market pricing with some of the new-machine peace of mind. A serious refurbisher replaces worn parts, verifies battery health, reinstalls a clean OS, and offers at least a short warranty. You pay slightly more than raw used — that difference is buying risk reduction.

## The Real Cost Comparison

Consider three ways to end up with a solid work machine:

- New consumer laptop: latest design, one-year warranty, lowest build quality tier
- Used business laptop: two to three generations old, enterprise build quality, no warranty beyond the seller's checking period
- Refurbished business laptop: same machine as used, plus replaced wear parts and a short warranty

The spec sheet will not show you the difference. The keyboard flex, the hinge, and the chassis rigidity will — three years later.

## The Questions That Decide It

Ask yourself, in order:

- Can I afford to replace this machine in a year if it fails? If no, lean new or refurbished.
- Do I know how to inspect a used laptop, or do I have someone who does? If no, buy from a seller who checks and stands behind the machine.
- Do I need this-generation performance, or is last generation plenty for my work?

Most students, office workers, and developers we serve answer "last generation is plenty" — which is why used and refurbished business laptops leave our shop fastest.

## One Warning for All Three

Whatever you buy, insist on knowing the battery's actual capacity and the storage drive's health. These are the two parts that age fastest, they are invisible in marketing photos, and they are the two parts that make an otherwise perfect machine frustrating to live with.$txt$,
  'https://images.unsplash.com/photo-1496181664578-3103372bf986?w=1200&q=80',
  'buying-guides',
  'ElectroGhar Team',
  NULL,
  '["refurbished","used","buying guide"]',
  false,
  true,
  '2026-08-20T10:00:00+05:00',
  519,
  'Refurbished vs Used vs New Laptops | ElectroGhar',
  $txt$New, used, or refurbished — which laptop is right for you? A shop-floor comparison of price, risk, build quality, and warranty for Pakistani buyers.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Best Budget Laptops Under PKR 50,000 in Pakistan (2026 Edition)',
  'best-budget-laptops-under-50000-pkr',
  $txt$Fifty thousand rupees is the most competitive price bracket in Pakistan. Here is what that budget realistically buys today — and the exact business-grade machines we would pick first.$txt$,
  $txt$PKR 50,000 is the sweet spot of the Pakistani laptop market — enough for a genuinely capable machine, low enough that every rupee has to work. Here is what that budget buys in 2026, and what to avoid.

## What 50K Realistically Gets You

Forget new machines at this price — a new laptop under 50K means a Celeron processor, 4GB of soldered RAM, and a 1366x768 panel. The smart play is a used or refurbished business laptop, two to four generations old, from the corporate fleets that get retired on schedule overseas.

At this budget you should target:

- 8th to 10th generation Intel Core i5 (or Ryzen 5 equivalents)
- 8GB of RAM, ideally 16GB or upgradeable
- 256GB SSD — non-negotiable in 2026
- A 1080p IPS display
- Business-line build quality

## The Machines We Would Pick First

The Lenovo ThinkPad T480 remains the benchmark. Legendary keyboard, easy to service, RAM up to 32GB, and typically available in this bracket with an i5 and 8GB. If you find one with a 1080p panel, buy it.

The Dell Latitude 7490 is the polish pick: thinner than the ThinkPad, excellent 1080p IPS panels, strong hinges, and widely available parts in Pakistan.

The HP EliteBook 840 G5 is the value sleeper — often cheaper than the other two with nearly identical real-world performance, a bright display, and a genuinely good keyboard.

All three were 250,000+ rupee machines when new. That is the entire thesis of the used market: yesterday's flagship beats today's budget tier.

## What to Avoid at This Price

- Consumer laptops with 4GB RAM and eMMC storage — they will feel slow within a year
- Anything without an SSD, regardless of how good the rest of the spec looks
- Gaming laptops at this price point — they are usually six-plus years old with dying GPUs and cooked cooling
- Machines with broken hinges or battery "issues" — repairs will eat your savings

## Spend the Difference Wisely

If you find a machine at 45K with 8GB of RAM, spending the remaining 5K on a RAM stick or a bigger SSD does more for your daily experience than hunting for a marginally faster CPU. An SSD and RAM upgrade transforms a good laptop; a slightly newer processor does not.

## The ElectroGhar Shortcut

Every machine we list in this bracket has already passed the full inspection checklist — battery health verified, storage SMART-checked, thermals stress-tested. If you would rather skip the OLX lottery, that is exactly why we exist.$txt$,
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
  'buying-guides',
  'Sana Malik',
  'Content & Research',
  '["budget laptops","pkr 50000","buying guide"]',
  false,
  true,
  '2026-08-15T10:00:00+05:00',
  677,
  'Best Laptops Under PKR 50,000 (2026) | ElectroGhar',
  $txt$What PKR 50,000 really buys in 2026: ThinkPad T480, Latitude 7490, EliteBook 840 G5, upgrade strategy, and the traps to avoid in the used market.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'SSD vs HDD: Why Storage Speed Matters More Than Size',
  'ssd-vs-hdd-storage-guide',
  $txt$A 256GB SSD will feel dramatically faster than a 1TB HDD. Here is why — and how much storage you actually need for work, study, or gaming.$txt$,
  $txt$If your laptop takes two minutes to boot and another minute to open Chrome, your problem is almost certainly not the processor. It is the hard drive. This is the single most misunderstood spec in the market, so let us settle it.

## The Speed Gap Is Not Subtle

A mechanical hard drive reads data at roughly 100-150 MB/s. A SATA SSD delivers 500-550 MB/s. An NVMe SSD delivers 3,000-7,000 MB/s. But raw numbers understate it — the real difference is random access, where an SSD is hundreds of times faster.

In daily life that means:

- Boot times drop from two minutes to fifteen seconds
- Apps open instantly instead of after a coffee sip
- Files copy in seconds
- The laptop never feels like it is "thinking"

## Why the HDD Still Exists

Price per gigabyte. A 1TB HDD costs less than a 256GB SSD, and marketing that leads with "1TB storage!" sells machines to people who have not felt the difference yet. In our workshop, the single most common upgrade we perform is swapping an HDD for an SSD — and the most common reaction is that it feels like a new laptop.

## How Much Storage Do You Actually Need?

Be honest about your usage:

- 256GB — plenty for study, office work, and browsing, if you keep media in the cloud
- 512GB — the comfortable default for most people, including light gaming
- 1TB and above — video editing, large game libraries, or big local media collections

External storage is cheap and fast over USB 3.0. Internal SSD speed is not replaceable. Prioritize accordingly.

## SATA vs NVMe — Does It Matter?

If both are options in your budget, take NVMe: it is faster and usually newer. But do not reject a great laptop because it has a SATA SSD — the jump from HDD to any SSD dwarfs the jump from SATA to NVMe.

## The Buying Advice

Never buy a laptop with a mechanical hard drive as its only storage in 2026 — no exceptions. If you are buying used and the machine has an HDD, budget for an SSD swap and treat it as a two-step purchase. If the machine already has an SSD, check its health with CrystalDiskInfo before paying; SSDs have a finite write life and a worn one is a negotiation point.

Speed you feel every single day beats capacity you touch twice a year.$txt$,
  'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=1200&q=80',
  'tech-tips',
  'ElectroGhar Team',
  NULL,
  '["ssd","hdd","storage","tech tips"]',
  false,
  true,
  '2026-08-10T10:00:00+05:00',
  448,
  'SSD vs HDD: Which Storage Do You Need? | ElectroGhar',
  $txt$Why any SSD feels up to a hundred times faster than an HDD, how much storage you really need, and the SATA vs NVMe question — explained simply.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  '7 Windows Settings Every New Laptop Owner Should Change',
  'windows-settings-new-laptop-owners',
  $txt$Fresh Windows is tuned for Microsoft, not for you. These seven settings remove the ads, the bloat, and the privacy leaks — and take under ten minutes total.$txt$,
  $txt$A new laptop arrives tuned to serve everyone except its owner. Ten minutes in Settings fixes that. Do these in order.

## 1. Uninstall What You Did Not Order

Open Installed Apps and remove the pre-installed trial antivirus, the vendor "assistant" utilities, and any game you did not ask for. Trial antivirus in particular fights Windows Defender for resources while nagging you to pay. Defender is genuinely good now.

## 2. Turn Off Startup Programs

Open Task Manager, go to the Startup tab, and disable everything you do not explicitly want running at boot — updaters, helper apps, sync clients. Each one steals boot time and RAM forever. Your laptop will feel faster immediately.

## 3. Kill the Ads and Suggestions

In Settings, search for "Content" under Personalization and turn off suggestions, tips, and experiences that feed you promos in the Start menu and lock screen. Windows should not be an advertising surface you paid for.

## 4. Set Your Power Plan Properly

For most people: Settings, System, Power, and set the screen and sleep timers to something sane. On a laptop, avoid "Best performance" on battery — it trades a lot of runtime for a little speed. Balanced is right for nearly everyone.

## 5. Check Your Privacy Settings

In Settings, Privacy & security, walk through the permissions. Does your calculator app really need location? Does everything need microphone access? Most should be off by default. While you are there, review the diagnostic data setting and set it to the minimum you are comfortable with.

## 6. Enable Storage Sense

In Settings, System, Storage, turn on Storage Sense so Windows automatically clears temp files and empties the recycle bin. On a 256GB SSD, this quietly prevents the "your disk is almost full" surprise six months from now.

## 7. Create a Restore Point Before You Tinker

Search for "Create a restore point", open it, and create one now, while the system is clean. If a future update or app install goes wrong, you can roll back in minutes instead of reinstalling everything.

## Bonus: Move Your Files Off the Desktop

Not for tidiness — for safety. A desktop full of documents is a desktop full of documents that are not being backed up. Keep work in Documents or OneDrive and sync it. When a drive dies, and eventually one will, you will be glad the important things lived somewhere with a copy.

That is the whole ritual. None of it costs anything, all of it saves time — and a machine set up this way stays fast for years instead of months.$txt$,
  'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1200&q=80',
  'tech-tips',
  'Sana Malik',
  'Content & Research',
  '["windows","setup","tech tips","new laptop"]',
  false,
  true,
  '2026-08-05T10:00:00+05:00',
  391,
  '7 Windows Settings to Change on a New Laptop | ElectroGhar',
  $txt$Remove the ads, bloat, and privacy leaks from fresh Windows in ten minutes: startup programs, power plans, Storage Sense, restore points, and more.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Laptop Overheating? 7 Fixes That Actually Work',
  'laptop-overheating-fixes',
  $txt$Fans screaming, chassis hot, performance dying? Overheating has a short list of real causes — and most of them are fixable at home. Here is the diagnostic order we use in the workshop.$txt$,
  $txt$"Laptop overheating" covers several different problems. Before you fix anything, identify which one you actually have: loud fans, a hot chassis, thermal shutdowns, or just slower performance under load. The fixes differ. Here is the order we work through at the bench — cheapest and most likely first.

## 1. Give the Fans Somewhere to Breathe

The number one cause we see: the laptop used on a bed, a lap, or a cushion. Every one of these blocks the intake vents on the bottom. Hard, flat surfaces only. If your lap is the desk, a rigid lap tray is a 500-rupee fix for a 50,000-rupee problem.

## 2. Blow the Dust Out

Two to three years of use cakes the heatsink fins with dust felt. A can of compressed air through the exhaust and intake vents, in short bursts, clears a shocking amount. Hold the fan still with a toothpick through the vent if you can — spinning a fan with compressed air can damage it.

If the machine still runs hot after this, it needs to be opened and cleaned properly.

## 3. Repaste the CPU

Thermal paste dries out in three to five years and stops conducting heat into the heatsink. Symptoms: fine when idle, hot and throttled within minutes of load. A repaste with good paste costs little and drops temperatures dramatically on older machines. On most business laptops this is a 20-minute job with a screwdriver.

## 4. Check What Is Actually Loading the CPU

Open Task Manager and sort by CPU. Background updaters, browser tabs running scripts, or malware can pin the processor at 100% — and a pinned processor means sustained heat. A laptop that is only hot while a runaway process burns CPU is not a cooling problem; it is a software problem.

## 5. Mind the Ambient Temperature

In a Pakistani summer, a 45-degree room means your laptop starts 20 degrees hotter than its design assumption. Nothing is broken. Shade the machine, add airflow, and accept that physics is undefeated.

## 6. Watch for the Fan That Never Spins

If the machine is hot and silent, the fan may be dead — seized bearing or a broken ribbon. This needs a fan replacement, and it needs it soon: a laptop that passively cooks its silicon is dying in slow motion.

## 7. Know When It Is the Design

Some machines — thin gaming laptops especially — simply run hot by design and throttle to compensate. If yours has always been this way since new, the fix list above will help at the margins, but the thermals are the thermals.

## What Not to Do

Do not install third-party fan-control tools to force the fan to maximum — they mask the symptom while the cause gets worse. And do not use a laptop cooling pad as a substitute for cleaning; a pad pushing air into clogged fins is a fan blowing at a wall.

Clean it, repaste it, let it breathe. In roughly 8 out of 10 machines that come to our bench "overheating", one of those three things is the entire story.$txt$,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
  'troubleshooting',
  'Bilal Ahmed',
  'Founder & Lead Technician',
  '["overheating","cooling","troubleshooting","maintenance"]',
  true,
  true,
  '2026-07-28T10:00:00+05:00',
  726,
  'Laptop Overheating: 7 Fixes That Work | ElectroGhar',
  $txt$The workshop diagnostic order for overheating laptops: airflow, dust, thermal paste, background load, dead fans — plus what not to do.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Laptop Won''t Turn On? A Step-by-Step Diagnostic',
  'laptop-wont-turn-on-diagnostic',
  $txt$Dead laptop? Do not panic and do not start disassembling it. Work through this sequence — it finds the cause in most cases, and tells you when it is time for a technician.$txt$,
  $txt$A laptop that will not turn on is rarely as dead as it looks. Work through this sequence in order — it isolates the fault in most machines in under ten minutes.

## Step 1: Define "Won''t Turn On"

Watch and listen carefully when you press the power button. Which case is yours?

- Case A — totally dead: no lights, no fans, no response at all
- Case B — signs of life: lights or fan spin, but a black screen
- Case C — it starts, shows something, then dies

Each case points somewhere different. Do not skip this step.

## Step 2: Case A — The Power Path

With no signs of life, suspect the power path first. Remove everything: charger, USB devices, SD cards, dongles. Hold the power button for 30 full seconds to drain residual charge — this resets the EC and fixes a surprising number of "dead" laptops.

Now plug in the charger and look for a charging LED. No LED at all? Try a different outlet, then test the charger: most third-party USB-C chargers will at least light the LED if the port and charger are alive. If the charger is fine and the LED stays dark on every outlet, the fault is the DC jack, the charging circuit, or the board — workshop territory.

## Step 3: Case B — Power but No Display

The machine is on (fan, lights, maybe heat) but the screen stays black. Do the flashlight test: shine a light at the screen in a dark room. If you can make out a faint image, the GPU is fine and the backlight has failed.

Then do the external display test: connect a monitor over HDMI. External works means GPU and system are alive — the problem is the panel or its cable. External also black means something deeper; try the Step 2 reset anyway.

Also listen for beep patterns or blink codes on the power LED — most manufacturers encode the failing component in them. Write down the pattern before you search for it; "3 blinks" means something specific to your model.

## Step 4: Case C — Starts Then Dies

Rapid shutdown points to thermal protection (see our overheating guide) or a failing power delivery. Shutting down at the same point in boot every time can also be storage failure — the system dies the moment it hands off to the drive.

## Step 5: RAM Reseat

On laptops with accessible RAM, power off, unplug, remove the battery if removable, then reseat both sticks — remove and firmly reinsert. A stick that has walked a millimetre out of its socket produces exactly this class of symptom. If there are two sticks, boot with each one alone; a bad stick identifies itself.

## When to Stop and Bring It In

Stop and get a technician if: the machine smells burnt, the charger LED indicates power but the EC reset and RAM reseat changed nothing, or the blink code points to the board. Board-level repair needs tools and schematics, not screwdriver courage.

One last thing — before any of this, check the obvious: is the charger actually the right wattage for the machine? A 45W charger on a gaming laptop that demands 180W will power lights and nothing else. We have seen "dead" laptops revived by the right brick more times than we can count.$txt$,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80',
  'troubleshooting',
  'ElectroGhar Team',
  NULL,
  '["troubleshooting","wont turn on","diagnostic","repair"]',
  false,
  true,
  '2026-07-20T10:00:00+05:00',
  312,
  'Laptop Won''t Turn On — Step-by-Step Diagnostic | ElectroGhar',
  $txt$Dead laptop diagnostic in order: power-path checks, EC reset, backlight flashlight test, blink codes, RAM reseat — and when to call a technician.$txt$
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blogs (title, slug, excerpt, content, cover_image, category, author, author_role, tags, is_featured, is_published, published_at, views, meta_title, meta_description) VALUES
(
  'Gaming PC or Gaming Laptop? An Honest Comparison',
  'gaming-pc-vs-gaming-laptop',
  $txt$Same budget, two very different machines. We break down performance, thermals, upgrades, and long-term value for Pakistani gamers — including the electricity math nobody mentions.$txt$,
  $txt$"For the same money, should I build a gaming PC or buy a gaming laptop?" We get this weekly, and the honest answer starts with a question back: where will you actually use it?

## The Performance Reality

A gaming PC at the same price as a gaming laptop simply performs better. Laptops pay a "portability tax" of roughly 20-30%: a mobile GPU is physically smaller, runs cooler, and is tuned to sip power. An RTX 4060 in a desktop is not the same silicon situation as an RTX 4060 in a laptop, even though the sticker says the same thing.

The desktop also holds its boost clocks under sustained load. A thin gaming laptop starts fast, then thermally throttles ten minutes into a session as heat saturates the chassis. Same sticker, different machine.

## Thermals and Noise

Desktops have volume to work with — big coolers, big airflow, quiet fans. Gaming laptops are a compromise between thickness and heat, and under load most of them sound like a hair dryer having an argument. If you game with headphones this matters less. If you share a room, it matters a lot.

## Upgradability — The Long Game

This is where the two paths really separate. A desktop replaces parts: GPU in three years, more storage next month, CPU when the platform demands it. A laptop replaces, realistically, RAM and storage — the GPU and CPU are soldered forever. The gaming laptop you buy is the machine you will have until you replace it entirely.

In a market like Pakistan, where import prices swing wildly, being able to upgrade one part instead of rebuying everything is genuine financial protection.

## The Portability Question

None of the PC advantages matter if you cannot use one. Students moving between home and hostel, anyone who games at a friend's place, people whose "desk" is wherever there is space — for them the laptop is not a compromise, it is the only option that works.

Be honest here: we have seen many "portable" gaming laptops that have not left the desk in two years. If that will be you, take the desktop performance.

## The Running-Cost Math Nobody Mentions

Desktops are easier to cool but typically draw more power at the wall, and used-market desktops in Pakistan often arrive with aging PSUs that deserve replacement. Laptops bundle the display, keyboard, and a battery-backed UPS for load shedding — that last point is not small in Pakistan. A desktop needs a UPS or it dies with the lights.

## Our Honest Recommendation

If the machine will mostly live on a desk and maximum frames per rupee is the goal: build a PC, and put real money into the PSU and cooling before chasing the GPU tier.

If you need one machine for study, work, and gaming: a used business laptop for daily work plus patience, or a well-cooled gaming laptop if the budget truly stretches — but check its thermals under load before paying.

If you move around and game seriously: the gaming laptop is not a compromise, it is the answer. Buy a thick one. Thin gaming laptops are a bet against physics.

Come tell us your budget and your situation — we stock both, so we have no reason to push you either way. That is the advantage of asking a shop that sells both.$txt$,
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1200&q=80',
  'reviews-comparisons',
  'Bilal Ahmed',
  'Founder & Lead Technician',
  '["gaming","pc build","comparison"]',
  false,
  true,
  '2026-07-12T10:00:00+05:00',
  588,
  'Gaming PC vs Gaming Laptop — Which to Buy? | ElectroGhar',
  $txt$Desktop vs gaming laptop compared honestly: the portability tax, thermals, upgradability, load-shedding math, and who should actually buy which.$txt$
)
ON CONFLICT (slug) DO NOTHING;
