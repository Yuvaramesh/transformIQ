# Changelog

All notable changes to TransformIQ are documented here.
Format: [version] — date — summary

---

## [1.0.0] — 2026-02-21

### Added
- **Progress Tracker**: Editable milestones with inline editing (pencil icon), double-click title rename, drag-to-reorder in timeline view
- **Timeline**: Task-based data table with Section, Task, Category, Start/End dates, Duration, Dependencies, Assignee, Status, Priority columns; auto-generated Gantt chart (SVG) with week/month scale toggle, today line, dependency arrows, draggable bars, Excel import/export
- **Cost Model**: Client-facing "Investment Summary" views — By Phase, By Resource Type, By Deliverable — with consultant-controlled visibility toggles and margin-hidden pricing
- **Branding**: 10qbit logo assets (logo2.png, 10qbit_logo.jpg) on login page, global sidebar, and project sidebar footer
- **Versioning**: App version tracking in `src/lib/version.ts`; version displayed on login page, global sidebar, and settings About tab
- **Messages**: Two-panel redesign with Project Chat (group) + per-member direct messages; Supabase Realtime presence (online/offline dots); unread badges per conversation
- **Files**: HTML file editor now supports save/overwrite (storage UPDATE RLS fixed)
- **Overview → Assessment deep linking**: Domain cards pass `?section=` param so assessment opens the correct section

### Database Migrations
- `00016`: Storage UPDATE policy for `project-files` bucket (upsert support)
- `00017`: `recipient_id` on `project_messages` + `direct_message_reads` table + DM-aware SELECT RLS
- `00018`: `project_timeline_tasks` table with RLS (enums: category, status, priority)

### Fixed
- HTML file save failing with RLS violation on upsert
- Messages page was a flat stream — now has conversation sidebar
- Overview domain cards always opened first section — now deep-links to correct section

---

## Version Numbering Rules
- **Major** (X.0.0): Breaking schema changes, complete redesigns, multi-tenant model changes
- **Minor** (1.X.0): New features, new pages, new database tables
- **Patch** (1.0.X): Bug fixes, UI polish, small improvements, copy changes
