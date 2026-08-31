#!/bin/bash

set -eu
umask 077

LABEL="com.algoleague.oci-a1-capacity-monitor"
USER_HOME="${HOME:?HOME is required}"
SOURCE_DIR="$(cd "$(dirname "$0")" && pwd)"
INSTALL_ROOT="${USER_HOME}/Library/Application Support/AlgoLeague/oci-capacity-monitor"
CONFIG_FILE="${INSTALL_ROOT}/monitor.conf"
INSTALLED_CHECKER="${INSTALL_ROOT}/check-capacity.sh"
LAUNCH_AGENT="${USER_HOME}/Library/LaunchAgents/${LABEL}.plist"
LOG_FILE="${INSTALL_ROOT}/monitor.log"
OUTPUT_LOG_FILE="${INSTALL_ROOT}/launchd-output.log"
ERROR_LOG_FILE="${INSTALL_ROOT}/launchd-error.log"

if [ "$(uname -s)" != "Darwin" ]; then
    printf '%s\n' "This installer supports macOS only." >&2
    exit 1
fi

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
    printf 'Usage: %s <root-tenancy-ocid> [oci-cli-profile]\n' "$0" >&2
    exit 64
fi

COMPARTMENT_OCID="$1"
OCI_PROFILE="${2:-DEFAULT}"

case "$COMPARTMENT_OCID" in
    ocid1.tenancy.oc1..*) ;;
    *)
        printf '%s\n' "The first argument must be the root tenancy OCID." >&2
        exit 1
        ;;
esac

OCI_BIN="$(command -v oci 2>/dev/null || true)"
if [ -z "$OCI_BIN" ] || [ ! -x "$OCI_BIN" ]; then
    printf '%s\n' "OCI CLI is not installed or not on PATH." >&2
    printf '%s\n' "Install/configure OCI CLI, then run this installer again." >&2
    exit 1
fi

if [ ! -r "${USER_HOME}/.oci/config" ]; then
    printf '%s\n' "OCI CLI config was not found at ${USER_HOME}/.oci/config." >&2
    printf '%s\n' "Run 'oci setup bootstrap' or 'oci setup config' first." >&2
    exit 1
fi

mkdir -p "$INSTALL_ROOT" "${USER_HOME}/Library/LaunchAgents"
install -m 700 "${SOURCE_DIR}/check-capacity.sh" "$INSTALLED_CHECKER"

printf '%s\n' \
    "OCI_COMPARTMENT_OCID=${COMPARTMENT_OCID}" \
    "OCI_CLI_PROFILE=${OCI_PROFILE}" \
    "OCI_CLI_BIN=${OCI_BIN}" \
    "OCI_REGION=ap-tokyo-1" \
    "OCI_AVAILABILITY_DOMAIN=CNKz:AP-TOKYO-1-AD-1" \
    "OCI_INSTANCE_SHAPE=VM.Standard.A1.Flex" \
    "OCI_INSTANCE_OCPUS=1" \
    "OCI_INSTANCE_MEMORY_GBS=6" > "$CONFIG_FILE"
chmod 600 "$CONFIG_FILE"

/usr/bin/plutil -create xml1 "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :Label string ${LABEL}" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :ProgramArguments array" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :ProgramArguments:0 string '${INSTALLED_CHECKER}'" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :ProgramArguments:1 string check" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :RunAtLoad bool true" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :StartInterval integer 300" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :StandardOutPath string '${OUTPUT_LOG_FILE}'" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :StandardErrorPath string '${ERROR_LOG_FILE}'" "$LAUNCH_AGENT"
/usr/libexec/PlistBuddy -c "Add :ProcessType string Background" "$LAUNCH_AGENT"
chmod 600 "$LAUNCH_AGENT"

LAUNCH_DOMAIN="gui/$(id -u)"
if /bin/launchctl print "${LAUNCH_DOMAIN}/${LABEL}" >/dev/null 2>&1; then
    /bin/launchctl bootout "${LAUNCH_DOMAIN}/${LABEL}"
fi

/bin/launchctl bootstrap "$LAUNCH_DOMAIN" "$LAUNCH_AGENT"
/bin/launchctl kickstart -k "${LAUNCH_DOMAIN}/${LABEL}"

printf '%s\n' "OCI A1 capacity monitor installed."
printf 'Status: %s status\n' "$INSTALLED_CHECKER"
printf 'Logs: tail -f %q\n' "$LOG_FILE"
printf 'Reset after an alert: %s reset\n' "$INSTALLED_CHECKER"
