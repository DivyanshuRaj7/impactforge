-- ============================================================================
-- Share&Care — Donation & Sharing Platform
-- Supabase PostgreSQL Schema Migration
-- ============================================================================
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- or via the Supabase CLI:  supabase db push
-- ============================================================================


-- ╔══════════════════════════════════════════════════╗
-- ║  1. CUSTOM ENUM TYPES                            ║
-- ╚══════════════════════════════════════════════════╝

CREATE TYPE user_role       AS ENUM ('donor', 'seeker', 'mediator');
CREATE TYPE listing_category AS ENUM ('food', 'clothes', 'study', 'medicine', 'other');
CREATE TYPE listing_urgency  AS ENUM ('urgent', '24hrs', 'flexible');
CREATE TYPE listing_status   AS ENUM ('active', 'expired', 'completed');
CREATE TYPE request_status   AS ENUM ('pending', 'accepted', 'completed');
CREATE TYPE delivery_type    AS ENUM ('direct', 'via_mediator');
CREATE TYPE message_type     AS ENUM ('preset', 'custom');


-- ╔══════════════════════════════════════════════════╗
-- ║  2. TABLES                                       ║
-- ╚══════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────
-- 2a. users — extends Supabase auth.users
-- ────────────────────────────────────────────────────
CREATE TABLE public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  role        user_role   NOT NULL DEFAULT 'seeker',
  verified    BOOLEAN     NOT NULL DEFAULT FALSE,
  rating      NUMERIC(2,1) NOT NULL DEFAULT 0.0
                          CHECK (rating >= 0 AND rating <= 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.users IS 'App-level profile linked 1-to-1 with auth.users';
COMMENT ON COLUMN public.users.rating IS 'Aggregate donor/seeker/mediator rating (0.0 – 5.0)';


-- ────────────────────────────────────────────────────
-- 2b. listings — items offered for donation
-- ────────────────────────────────────────────────────
CREATE TABLE public.listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id        UUID             NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT             NOT NULL,
  category        listing_category NOT NULL,
  urgency         listing_urgency  NOT NULL DEFAULT 'flexible',
  description     TEXT             NOT NULL DEFAULT '',
  photo_url       TEXT,                                        -- Supabase Storage public URL
  pickup_time_slot TEXT            NOT NULL DEFAULT '',         -- human-readable slot
  location_lat    DOUBLE PRECISION NOT NULL DEFAULT 0,
  location_lng    DOUBLE PRECISION NOT NULL DEFAULT 0,
  status          listing_status   NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ                                  -- NULL = never auto-expire
);

COMMENT ON TABLE  public.listings IS 'Donation items posted by donors';
COMMENT ON COLUMN public.listings.expires_at IS 'When set, a cron / edge function marks status = expired after this time';


-- ────────────────────────────────────────────────────
-- 2c. requests — seekers requesting a listing
-- ────────────────────────────────────────────────────
CREATE TABLE public.requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id     UUID           NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id    UUID           NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  status        request_status NOT NULL DEFAULT 'pending',
  delivery_type delivery_type  NOT NULL DEFAULT 'direct',
  message       TEXT           NOT NULL DEFAULT '',            -- preset message chosen by seeker
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),

  -- prevent duplicate requests by the same seeker on the same listing
  UNIQUE (seeker_id, listing_id)
);

COMMENT ON TABLE public.requests IS 'Seeker requests against a listing';


-- ────────────────────────────────────────────────────
-- 2d. ratings — post-exchange feedback
-- ────────────────────────────────────────────────────
CREATE TABLE public.ratings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rated_user_id UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id    UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  score         SMALLINT    NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- one rating per rater per listing
  UNIQUE (rater_id, listing_id)
);

COMMENT ON TABLE public.ratings IS 'Star ratings (1–5) exchanged after a transaction';


-- ────────────────────────────────────────────────────
-- 2e. messages — preset / custom messages
-- ────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id   UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listing_id    UUID         NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  message_type  message_type NOT NULL DEFAULT 'preset',
  content       TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.messages IS 'Simple messaging (primarily preset phrases)';


-- ╔══════════════════════════════════════════════════╗
-- ║  3. INDEXES — query performance                  ║
-- ╚══════════════════════════════════════════════════╝

-- Geolocation: speed up "nearby" bounding-box pre-filter
CREATE INDEX idx_listings_location
  ON public.listings (location_lat, location_lng)
  WHERE status = 'active';

-- Category & Urgency filters on the Home screen
CREATE INDEX idx_listings_category
  ON public.listings (category)
  WHERE status = 'active';

CREATE INDEX idx_listings_urgency
  ON public.listings (urgency)
  WHERE status = 'active';

-- Combined filter: category + urgency (covers the most common Home queries)
CREATE INDEX idx_listings_cat_urgency
  ON public.listings (category, urgency)
  WHERE status = 'active';

-- Donor's own listings lookup (Profile screen)
CREATE INDEX idx_listings_donor
  ON public.listings (donor_id, created_at DESC);

-- Seeker's requests lookup (Profile screen / Request Flow)
CREATE INDEX idx_requests_seeker
  ON public.requests (seeker_id, created_at DESC);

-- Requests against a specific listing
CREATE INDEX idx_requests_listing
  ON public.requests (listing_id);

-- Message history between users on a listing
CREATE INDEX idx_messages_listing
  ON public.messages (listing_id, created_at);

-- Ratings per rated user (for aggregating user rating)
CREATE INDEX idx_ratings_rated_user
  ON public.ratings (rated_user_id);


-- ╔══════════════════════════════════════════════════╗
-- ║  4. ROW LEVEL SECURITY (RLS) POLICIES            ║
-- ╚══════════════════════════════════════════════════╝

-- Enable RLS on every table
ALTER TABLE public.users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


-- ── users ──────────────────────────────────────────

-- Anyone logged-in can read all profiles (for donor names, ratings, etc.)
CREATE POLICY "Users: anyone can read profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

-- A user can only insert their own row (on first sign-up)
CREATE POLICY "Users: insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- A user can only update their own row
CREATE POLICY "Users: update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ── listings ───────────────────────────────────────

-- Anyone logged-in can browse all active listings
CREATE POLICY "Listings: anyone can read"
  ON public.listings FOR SELECT
  TO authenticated
  USING (true);

-- Donors can create listings (donor_id must match auth user)
CREATE POLICY "Listings: donors can insert"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

-- Donors can update only their own listings (title, status, etc.)
CREATE POLICY "Listings: donors can update own"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id)
  WITH CHECK (auth.uid() = donor_id);

-- Donors can delete only their own listings
CREATE POLICY "Listings: donors can delete own"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = donor_id);


-- ── requests ───────────────────────────────────────

-- Seekers can see their own requests; donors can see requests on their listings
CREATE POLICY "Requests: involved parties can read"
  ON public.requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = seeker_id
    OR auth.uid() IN (
      SELECT donor_id FROM public.listings WHERE id = listing_id
    )
  );

-- Seekers can create a request
CREATE POLICY "Requests: seekers can insert"
  ON public.requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seeker_id);

-- Seekers can update their own request (e.g. cancel);
-- Donors can update requests on their listings (e.g. accept)
CREATE POLICY "Requests: involved parties can update"
  ON public.requests FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = seeker_id
    OR auth.uid() IN (
      SELECT donor_id FROM public.listings WHERE id = listing_id
    )
  );


-- ── ratings ────────────────────────────────────────

-- Anyone logged-in can see ratings (public trust)
CREATE POLICY "Ratings: anyone can read"
  ON public.ratings FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own rating
CREATE POLICY "Ratings: users can insert own"
  ON public.ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = rater_id);


-- ── messages ───────────────────────────────────────

-- Sender and receiver can read their own messages
CREATE POLICY "Messages: involved parties can read"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Sender can insert a message
CREATE POLICY "Messages: sender can insert"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);


-- ╔══════════════════════════════════════════════════╗
-- ║  5. AUTO-EXPIRE LISTINGS (pg_cron function)      ║
-- ╚══════════════════════════════════════════════════╝
-- Supabase supports pg_cron. Enable it under Dashboard → Database → Extensions.
-- Then schedule this function to run e.g. every 5 minutes.

CREATE OR REPLACE FUNCTION public.expire_old_listings()
RETURNS void
LANGUAGE sql
SECURITY DEFINER          -- runs with table-owner privileges
AS $$
  UPDATE public.listings
  SET    status = 'expired'
  WHERE  status = 'active'
    AND  expires_at IS NOT NULL
    AND  expires_at < now();
$$;

COMMENT ON FUNCTION public.expire_old_listings IS
  'Marks active listings as expired when expires_at has passed. '
  'Schedule with pg_cron: SELECT cron.schedule(''expire-listings'', ''*/5 * * * *'', $$SELECT public.expire_old_listings()$$);';


-- ╔══════════════════════════════════════════════════╗
-- ║  6. AUTO-UPDATE USER RATING (trigger)            ║
-- ╚══════════════════════════════════════════════════╝
-- Recalculates users.rating whenever a new rating row is inserted.

CREATE OR REPLACE FUNCTION public.recalculate_user_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET rating = (
    SELECT ROUND(AVG(score)::numeric, 1)
    FROM   public.ratings
    WHERE  rated_user_id = NEW.rated_user_id
  )
  WHERE id = NEW.rated_user_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recalculate_rating
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_user_rating();


-- ╔══════════════════════════════════════════════════╗
-- ║  7. STORAGE BUCKET (run separately if needed)    ║
-- ╚══════════════════════════════════════════════════╝
-- Supabase Storage buckets are managed via the Dashboard or the API.
-- Ensure you have a PUBLIC bucket called "listings-photos".
--
-- Dashboard path: Storage → New Bucket → Name: listings-photos → Public: ON
--
-- The photo_url in listings will store the full public URL:
--   https://<project>.supabase.co/storage/v1/object/public/listings-photos/<filename>
