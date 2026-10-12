-- ============================================================================
-- FixIt — Migration 0090: Announcement in_banner column
-- ----------------------------------------------------------------------------
-- Adds `in_banner` boolean column to public.announcements for explicit admin
-- banner curation on the student dashboard.
-- ============================================================================

alter table public.announcements
  add column if not exists in_banner boolean not null default false;

-- Auto-mark the first 6 announcements with images as in_banner if none are set
update public.announcements
set in_banner = true
where id in (
  select id from public.announcements
  where image_url is not null and trim(image_url) != ''
  order by pinned desc, created_at desc
  limit 6
);

comment on column public.announcements.in_banner is
  'Flag indicating whether this announcement is selected by admin to be featured in the dashboard banner carousel.';
