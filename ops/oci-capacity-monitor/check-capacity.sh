#!/bin/bash

set -u
umask 077

MONITOR_LABEL="com.algoleague.oci-a1-capacity-monitor"
USER_HOME="${HOME:?HOME is required}"
MONITOR_ROOT="${OCI_CAPACITY_MONITOR_ROOT:-${USER_HOME}/Library/Application Support/AlgoLeague/oci-capacity-monitor}"
CONFIG_FILE="${OCI_CAPACITY_MONITOR_CONFIG:-${MONITOR_ROOT}/monitor.conf}"
STATUS_FILE="${MONITOR_ROOT}/last-status.txt"
ALERT_MARKER="${MONITOR_ROOT}/available-alert-sent"
LOG_FILE="${MONITOR_ROOT}/monitor.log"

log_message() {
    local message="$1"
    local timestamp
    timestamp="$(date '+%Y-%m-%d %H:%M:%S %z')"
    printf '%s %s\n' "$timestamp" "$message" | tee -a "$LOG_FILE"
}

reset_monitor() {
    if [ -f "$ALERT_MARKER" ]; then
        rm -f -- "$ALERT_MARKER"
    fi
    log_message "Availability alert state reset. Monitoring will resume."
}

show_status() {
    if [ -r "$STATUS_FILE" ]; then
        cat "$STATUS_FILE"
    else
        printf '%s\n' "No capacity check has completed yet."
    fi
}

case "${1:-check}" in
    check)
        ;;
    reset)
        mkdir -p "$MONITOR_ROOT"
        reset_monitor
        exit 0
        ;;
    status)
        show_status
        exit 0
        ;;
    *)
        printf 'Usage: %s [check|reset|status]\n' "$0" >&2
        exit 64
        ;;
esac

mkdir -p "$MONITOR_ROOT"

if [ ! -r "$CONFIG_FILE" ]; then
    log_message "ERROR: Configuration file is missing: ${CONFIG_FILE}"
    exit 1
fi

OCI_COMPARTMENT_OCID=""
OCI_CLI_PROFILE="DEFAULT"
OCI_CLI_BIN=""
OCI_REGION="ap-tokyo-1"
OCI_AVAILABILITY_DOMAIN="CNKz:AP-TOKYO-1-AD-1"
OCI_INSTANCE_SHAPE="VM.Standard.A1.Flex"
OCI_INSTANCE_OCPUS="1"
OCI_INSTANCE_MEMORY_GBS="6"

while IFS='=' read -r config_key config_value; do
    case "$config_key" in
        ""|\#*) continue ;;
        OCI_COMPARTMENT_OCID) OCI_COMPARTMENT_OCID="$config_value" ;;
        OCI_CLI_PROFILE) OCI_CLI_PROFILE="$config_value" ;;
        OCI_CLI_BIN) OCI_CLI_BIN="$config_value" ;;
        OCI_REGION) OCI_REGION="$config_value" ;;
        OCI_AVAILABILITY_DOMAIN) OCI_AVAILABILITY_DOMAIN="$config_value" ;;
        OCI_INSTANCE_SHAPE) OCI_INSTANCE_SHAPE="$config_value" ;;
        OCI_INSTANCE_OCPUS) OCI_INSTANCE_OCPUS="$config_value" ;;
        OCI_INSTANCE_MEMORY_GBS) OCI_INSTANCE_MEMORY_GBS="$config_value" ;;
        *)
            log_message "ERROR: Unsupported configuration key: ${config_key}"
            exit 1
            ;;
    esac
done < "$CONFIG_FILE"

case "$OCI_COMPARTMENT_OCID" in
    ocid1.tenancy.oc1..*) ;;
    *)
        log_message "ERROR: OCI_COMPARTMENT_OCID must be the root tenancy OCID."
        exit 1
        ;;
esac

case "$OCI_INSTANCE_OCPUS:$OCI_INSTANCE_MEMORY_GBS" in
    *[!0-9:]*|:*|*:)
        log_message "ERROR: OCPU and memory values must be positive integers."
        exit 1
        ;;
esac

if [ -z "$OCI_CLI_BIN" ]; then
    OCI_CLI_BIN="$(command -v oci 2>/dev/null || true)"
fi

if [ -z "$OCI_CLI_BIN" ] || [ ! -x "$OCI_CLI_BIN" ]; then
    log_message "ERROR: OCI CLI was not found. Install it and run the installer again."
    exit 1
fi

if [ -f "$ALERT_MARKER" ]; then
    log_message "Availability was already reported. Run 'check-capacity.sh reset' to resume."
    exit 0
fi

SHAPE_REQUEST="[{\"instanceShape\":\"${OCI_INSTANCE_SHAPE}\",\"instanceShapeConfig\":{\"ocpus\":${OCI_INSTANCE_OCPUS},\"memoryInGBs\":${OCI_INSTANCE_MEMORY_GBS}}}]"

CAPACITY_STATUS="$($OCI_CLI_BIN compute compute-capacity-report create \
    --region "$OCI_REGION" \
    --availability-domain "$OCI_AVAILABILITY_DOMAIN" \
    --compartment-id "$OCI_COMPARTMENT_OCID" \
    --shape-availabilities "$SHAPE_REQUEST" \
    --profile "$OCI_CLI_PROFILE" \
    --query 'data."shape-availabilities"[*]."availability-status"' \
    --raw-output 2>>"$LOG_FILE")"
COMMAND_STATUS=$?

if [ "$COMMAND_STATUS" -ne 0 ]; then
    log_message "ERROR: OCI capacity report failed with exit code ${COMMAND_STATUS}."
    exit "$COMMAND_STATUS"
fi

CAPACITY_STATUS="$(printf '%s' "$CAPACITY_STATUS" | tr -d '[]",[:space:]')"
printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')" "$CAPACITY_STATUS" > "$STATUS_FILE"

case "$CAPACITY_STATUS" in
    *AVAILABLE*)
        touch "$ALERT_MARKER"
        log_message "AVAILABLE: ${OCI_INSTANCE_SHAPE} ${OCI_INSTANCE_OCPUS} OCPU/${OCI_INSTANCE_MEMORY_GBS}GB in ${OCI_AVAILABILITY_DOMAIN}."
        /usr/bin/osascript -e 'display notification "Tokyo A1 1 OCPU/6GB capacity is AVAILABLE. Run Resource Manager Plan and Apply now." with title "Algo League OCI capacity" sound name "Glass"' >/dev/null 2>&1 || true
        ;;
    *OUT_OF_HOST_CAPACITY*)
        log_message "OUT_OF_HOST_CAPACITY: no matching Tokyo A1 capacity."
        ;;
    *)
        log_message "UNKNOWN: OCI returned capacity status '${CAPACITY_STATUS}'."
        exit 1
        ;;
esac
