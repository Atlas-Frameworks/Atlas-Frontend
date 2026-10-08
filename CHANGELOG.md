# Changelog

All notable changes to Atlas are documented in this file. Atlas follows
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Made the Artifactory shared writer lock optional. Without
  `ATLAS_ARTIFACTORY_LOCK_RESOURCE`, Atlas no longer requires
  `ATLAS_PUBLICATION_LOCK`; callers must serialize writers themselves.
- Removed the `Cache-Control` check from Artifactory public delivery
  verification, so Atlas no longer confirms the delivery path serves the
  expected cache policy. Atlas still compares `Content-Type`, size, and
  SHA-256 digest. The `Content-Type` comparison now ignores parameters such as
  `charset`.

## [1.0.0]

### Changed

- Released Atlas packages and the Columbus extension as 1.0.0.

- Migrated the source workspace and CI from Yarn 1 to pnpm 10 with a committed
  cross-platform lockfile.

### Added

- Initial TypeScript-first Atlas platform with Angular and React support.
- Static-registry discovery, Native Federation loading, routing, lifecycle UI,
  host SDK capabilities, event bus, overlays, and exported widgets.
- Interactive generators, provider-neutral deployment artifacts, package
  verification, and Columbus extension overrides.
