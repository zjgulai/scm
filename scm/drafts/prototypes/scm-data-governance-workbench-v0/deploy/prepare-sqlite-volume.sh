#!/usr/bin/env bash
set -euo pipefail

project_name="${COMPOSE_PROJECT_NAME:-scm_governance_workbench}"
container_name="${SCM_CONTAINER_NAME:-scm-governance-workbench}"
volume_name="${SCM_DATA_VOLUME_NAME:-${project_name}_scm-governance-data}"
seed_dir="${SCM_VOLUME_SEED_DIR:-/tmp/scm-governance-volume-seed-$$}"
force_seed="${SCM_FORCE_VOLUME_SEED:-0}"
source_db="${SCM_SOURCE_DB:-}"
source_import_summary="${SCM_SOURCE_IMPORT_SUMMARY:-}"

mkdir -p "${seed_dir}"
cleanup() {
  rm -rf "${seed_dir}"
}
trap cleanup EXIT

echo "Preparing SQLite volume: ${volume_name}"
docker volume create "${volume_name}" >/dev/null

if docker run --rm -v "${volume_name}:/target" node:22-bookworm-slim sh -lc 'test -f /target/governance_workbench.sqlite'; then
  if [ "${force_seed}" != "1" ]; then
    echo "Volume already contains governance_workbench.sqlite; leaving it unchanged."
    exit 0
  fi
  echo "SCM_FORCE_VOLUME_SEED=1 set; existing volume database will be replaced."
fi

if docker ps --format '{{.Names}}' | grep -qx "${container_name}"; then
  echo "Copying SQLite data from running container: ${container_name}"
  docker cp "${container_name}:/app/data/governance_workbench.sqlite" "${seed_dir}/governance_workbench.sqlite"
  docker cp "${container_name}:/app/data/import-summary.json" "${seed_dir}/import-summary.json" 2>/dev/null || true
elif [ -n "${source_db}" ] && [ -f "${source_db}" ]; then
  echo "Copying SQLite data from SCM_SOURCE_DB: ${source_db}"
  cp "${source_db}" "${seed_dir}/governance_workbench.sqlite"
  if [ -n "${source_import_summary}" ] && [ -f "${source_import_summary}" ]; then
    cp "${source_import_summary}" "${seed_dir}/import-summary.json"
  fi
elif [ -f "data/governance_workbench.sqlite" ]; then
  echo "Copying SQLite data from current release data directory."
  cp "data/governance_workbench.sqlite" "${seed_dir}/governance_workbench.sqlite"
  [ -f "data/import-summary.json" ] && cp "data/import-summary.json" "${seed_dir}/import-summary.json"
else
  echo "No SQLite source found. Start with an existing container, set SCM_SOURCE_DB, or run from a release containing data/governance_workbench.sqlite." >&2
  exit 1
fi

docker run --rm \
  -v "${volume_name}:/target" \
  -v "${seed_dir}:/seed:ro" \
  node:22-bookworm-slim \
  sh -lc 'set -e; mkdir -p /target; cp /seed/governance_workbench.sqlite /target/governance_workbench.sqlite; if [ -f /seed/import-summary.json ]; then cp /seed/import-summary.json /target/import-summary.json; fi; ls -lh /target/governance_workbench.sqlite'

echo "SQLite volume is ready: ${volume_name}"
