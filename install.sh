#!/usr/bin/env bash
# Installs this subscription page template into a PasarGuard panel.
set -euo pipefail

REPO="NPNTEI/subscription"
LANG_CODE="fa"
VERSION="main"
DEST_DIR="/var/lib/pasarguard/templates/subscription"
DEST_FILE="${DEST_DIR}/index.html"
ENV_FILE="/opt/pasarguard/.env"

usage() {
  cat <<'EOF'
Usage: install.sh [--lang fa|en|ru|zh] [--version <branch-or-tag>]

  --lang      Default language of the page (visitors can still switch). Default: fa
  --version   Branch or tag to install from. Default: main

Examples:
  install.sh
  install.sh --lang en
  install.sh --lang fa --version v1.0.0
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lang)
      [[ $# -ge 2 ]] || { echo "Error: --lang needs a value (fa|en|ru|zh)." >&2; exit 1; }
      LANG_CODE="$2"
      shift 2
      ;;
    --version)
      [[ $# -ge 2 ]] || { echo "Error: --version needs a value (branch or tag)." >&2; exit 1; }
      VERSION="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Error: unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

case "${LANG_CODE}" in
  fa|en|ru|zh) ;;
  *)
    echo "Error: invalid language '${LANG_CODE}'. Use one of: fa, en, ru, zh." >&2
    exit 1
    ;;
esac

if [[ ! "${VERSION}" =~ ^[A-Za-z0-9._/-]+$ ]]; then
  echo "Error: invalid version '${VERSION}'." >&2
  exit 1
fi

URL="https://raw.githubusercontent.com/${REPO}/${VERSION}/index.html"
TMP_FILE="$(mktemp)"
trap 'rm -f "${TMP_FILE}"' EXIT

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "${URL}" -o "${TMP_FILE}"
elif command -v wget >/dev/null 2>&1; then
  wget -q -O "${TMP_FILE}" "${URL}"
else
  echo "Error: neither curl nor wget is installed." >&2
  exit 1
fi

if ! grep -q 'data-default-lang=' "${TMP_FILE}"; then
  echo "Error: downloaded file is not a valid template (${URL})." >&2
  exit 1
fi

sed -i "s|data-default-lang=\"[a-z]*\"|data-default-lang=\"${LANG_CODE}\"|" "${TMP_FILE}"

mkdir -p "${DEST_DIR}"
if [[ -f "${DEST_FILE}" ]]; then
  cp -f "${DEST_FILE}" "${DEST_FILE}.bak"
fi
install -m 644 "${TMP_FILE}" "${DEST_FILE}"

mkdir -p "$(dirname "${ENV_FILE}")"
touch "${ENV_FILE}"

set_env() {
  local key="$1" value="$2"
  if grep -q "^${key}=" "${ENV_FILE}"; then
    sed -i "s|^${key}=.*|${key}=\"${value}\"|" "${ENV_FILE}"
  else
    # make sure the file ends with a newline before appending
    [[ -s "${ENV_FILE}" && -n "$(tail -c1 "${ENV_FILE}")" ]] && echo >> "${ENV_FILE}"
    echo "${key}=\"${value}\"" >> "${ENV_FILE}"
  fi
}

set_env CUSTOM_TEMPLATES_DIRECTORY "/var/lib/pasarguard/templates/"
set_env SUBSCRIPTION_PAGE_TEMPLATE "subscription/index.html"

if command -v pasarguard >/dev/null 2>&1; then
  pasarguard restart
  echo "Installed template (${LANG_CODE}, ${VERSION}) and restarted PasarGuard."
else
  echo "Installed template (${LANG_CODE}, ${VERSION}) at ${DEST_FILE}."
  echo "pasarguard command not found, restart the service manually."
fi
